const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking and initializing contract with the account:", deployer.address);

  // 공식 UUPS 프록시 주소
  const PROXY_ADDRESS = "0x860806488d547B4927c19bb5487274Effd33185d";

  // 0. 프록시가 바라보는 실제 구현체(V2) 주소 확인
  console.log("\n0. Checking current implementation (V2) address...");
  const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  const implAddress = await ethers.provider.getStorageAt(PROXY_ADDRESS, IMPLEMENTATION_SLOT);
  console.log("Current implementation (V2) address:", "0x" + implAddress.slice(26));

  // 1. ContractV1 인터페이스로 현재 상태 확인
  console.log("\n1. Checking current state with V1 interface...");
  const ContractV1 = await ethers.getContractFactory("ContractV1");
  const proxyContractV1 = ContractV1.attach(PROXY_ADDRESS);
  
  try {
    console.log("Value:", await proxyContractV1.getValue());
    console.log("Name:", await proxyContractV1.getName());
    console.log("Version:", await proxyContractV1.version());
    console.log("Owner:", await proxyContractV1.owner());
  } catch (error) {
    console.log("Error checking V1 state:", error.message);
  }

  // 2. ContractV2 인터페이스로 상태 확인
  console.log("\n2. Checking state with V2 interface...");
  const ContractV2 = await ethers.getContractFactory("ContractV2");
  const proxyContractV2 = ContractV2.attach(PROXY_ADDRESS);
  
  try {
    
    console.log("Value:", await proxyContractV2.getValue());
    console.log("Name:", await proxyContractV2.getName());
    console.log("Version:", await proxyContractV2.version());
    console.log("Count:", await proxyContractV2.getCount());
  } catch (error) {
    console.log("Error checking V2 state:", error.message);
  }

  // 3. initializeV2 수동 호출 시도
  console.log("\n3. Trying to manually call initializeV2...");
  try {
    const tx = await proxyContractV2.initializeV2();
    await tx.wait();
    console.log("initializeV2 called successfully!");
  } catch (error) {
    console.log("initializeV2 error:", error.message);
  }

  // 4. 다시 상태 확인
  console.log("\n4. Checking state after initialization attempt...");
  try {
    console.log("Value:", await proxyContractV2.getValue());
    console.log("Name:", await proxyContractV2.getName());
    console.log("Version:", await proxyContractV2.version());
    console.log("Count:", await proxyContractV2.getCount());
  } catch (error) {
    console.log("Error checking state after init:", error.message);
  }

  // 5. V2 기능 테스트
  console.log("\n5. Testing V2 functionality:");
  try {
    await proxyContractV2.incrementCount();
    console.log("Count after increment:", await proxyContractV2.getCount());

    await proxyContractV2.incrementCount();
    console.log("Count after second increment:", await proxyContractV2.getCount());

    const [value, count] = await proxyContractV2.getValueAndCount();
    console.log("Value and Count:", value, count);

    await proxyContractV2.batchUpdate(100, "My Contract V2");
    console.log("Batch updated value:", await proxyContractV2.getValue());
    console.log("Batch updated name:", await proxyContractV2.getName());
    console.log("Batch updated count:", await proxyContractV2.getCount());
  } catch (error) {
    console.log("V2 functionality error:", error.message);
  }

  console.log("\n=== CHECK COMPLETED ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 