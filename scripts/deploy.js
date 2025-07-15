const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // OpenZeppelin의 공식 UUPS 프록시로 ContractV1 배포
  console.log("\n1. Deploying ContractV1 with official UUPS proxy...");
  const ContractV1 = await ethers.getContractFactory("ContractV1");
  const contractV1 = await upgrades.deployProxy(ContractV1, [deployer.address], {
    kind: 'uups',
    initializer: 'initialize'
  });
  await contractV1.waitForDeployment();
  
  const contractV1Address = await contractV1.getAddress();
  console.log("ContractV1 with UUPS proxy deployed to:", contractV1Address);

  // 초기 상태 확인
  console.log("\n2. Checking initial state...");
  console.log("Value:", await contractV1.getValue());
  console.log("Name:", await contractV1.getName());
  console.log("Version:", await contractV1.version());
  console.log("Owner:", await contractV1.owner());

  // 초기 값 설정
  console.log("\n3. Setting initial values...");
  
  try {
    console.log("Setting value to 42...");
    const setValueTx = await contractV1.setValue(42);
    await setValueTx.wait();
    console.log("Value set successfully!");
    
    console.log("Setting name to 'My Contract'...");
    const setNameTx = await contractV1.setName("My Contract");
    await setNameTx.wait();
    console.log("Name set successfully!");
    
    console.log("Updated Value:", await contractV1.getValue());
    console.log("Updated Name:", await contractV1.getName());
  } catch (error) {
    console.error("Error setting initial values:", error.message);
  }

  // 배포 정보 요약
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("UUPS Proxy Address:", contractV1Address);
  console.log("Owner:", deployer.address);
  console.log("==========================");

  console.log("\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ===");
  console.log("이제 upgrades.upgradeProxy로 업그레이드할 수 있습니다!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 