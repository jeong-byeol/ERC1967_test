const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading to V2 with the account:", deployer.address);

  // 프록시 주소 (V1이 배포된 프록시 주소로 변경하세요)
  const PROXY_ADDRESS = "0x860806488d547B4927c19bb5487274Effd33185d";

  // 1. 현재 V1 상태 확인
  console.log("\n1. Checking current V1 state...");
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

  // 2. ContractV2로 업그레이드
  console.log("\n2. Upgrading to ContractV2...");
  const ContractV2 = await ethers.getContractFactory("ContractV2");

  try {
    // 업그레이드 (initializeV2는 call 옵션으로 호출)
    const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, ContractV2, {
      kind: "uups",
      call: { fn: "initializeV2", args: [] }
    });
    await upgraded.waitForDeployment();

    console.log("✅ Contract upgraded to V2 successfully!");
    console.log("Upgraded contract address:", await upgraded.getAddress());
  } catch (error) {
    console.log("❌ Upgrade error:", error.message);
    
    // 대안: call 옵션 없이 업그레이드 후 수동으로 initializeV2 호출
    console.log("\nTrying alternative upgrade method...");
    try {
      const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, ContractV2, {
        kind: "uups"
      });
      await upgraded.waitForDeployment();
      console.log("✅ Alternative upgrade successful!");
      
      // 수동으로 initializeV2 호출
      console.log("Manually calling initializeV2...");
      await upgraded.initializeV2();
      console.log("✅ initializeV2 called successfully!");
    } catch (error2) {
      console.log("❌ Alternative upgrade error:", error2.message);
      return;
    }
  }

  // 3. 업그레이드 후 V2 상태 확인
  console.log("\n3. Checking V2 state after upgrade...");
  const ContractV2Factory = await ethers.getContractFactory("ContractV2");
  const proxyContractV2 = ContractV2Factory.attach(PROXY_ADDRESS);
  
  try {
    console.log("Value:", await proxyContractV2.getValue());
    console.log("Name:", await proxyContractV2.getName());
    console.log("Version:", await proxyContractV2.version());
    console.log("Count:", await proxyContractV2.getCount());
  } catch (error) {
    console.log("Error checking V2 state:", error.message);
  }

  // 4. V2 기능 테스트
  console.log("\n4. Testing V2 functionality:");
  try {
    // Count 조작 테스트
    console.log("Testing incrementCount...");
    await proxyContractV2.incrementCount();
    console.log("Count after increment:", await proxyContractV2.getCount());

    await proxyContractV2.incrementCount();
    console.log("Count after second increment:", await proxyContractV2.getCount());

    // getValueAndCount 함수 테스트
    console.log("Testing getValueAndCount...");
    const [value, count] = await proxyContractV2.getValueAndCount();
    console.log("Value and Count:", value, count);

    // batchUpdate 함수 테스트
    console.log("Testing batchUpdate...");
    await proxyContractV2.batchUpdate(100, "My Contract V2");
    console.log("Batch updated value:", await proxyContractV2.getValue());
    console.log("Batch updated name:", await proxyContractV2.getName());
    console.log("Batch updated count:", await proxyContractV2.getCount());
    
    console.log("✅ All V2 functions working correctly!");
  } catch (error) {
    console.log("❌ V2 functionality error:", error.message);
  }

  // 5. V1 기능도 여전히 작동하는지 확인
  console.log("\n5. Verifying V1 functions still work:");
  try {
    await proxyContractV2.setValue(999);
    console.log("✅ setValue works:", await proxyContractV2.getValue());
    
    await proxyContractV2.setName("V1 Functions Test");
    console.log("✅ setName works:", await proxyContractV2.getName());
    
    console.log("✅ All V1 functions still working!");
  } catch (error) {
    console.log("❌ V1 functionality error:", error.message);
  }

  console.log("\n=== UPGRADE TO V2 COMPLETED SUCCESSFULLY ===");
  console.log("🎉 Proxy successfully upgraded to V2!");
  console.log("📍 Proxy address:", PROXY_ADDRESS);
  console.log("🔧 V2 features now available: incrementCount, getCount, getValueAndCount, batchUpdate");
  console.log("✅ V1 features preserved: setValue, setName, getValue, getName");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 