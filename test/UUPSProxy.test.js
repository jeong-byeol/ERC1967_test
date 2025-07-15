const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("UUPS Proxy Tests", function () {
  let contractV1, contractV2, proxy;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    // ContractV1 배포
    const ContractV1 = await ethers.getContractFactory("ContractV1");
    contractV1 = await upgrades.deployProxy(ContractV1, [owner.address], {
      kind: 'uups',
      initializer: 'initialize'
    });
    await contractV1.waitForDeployment();
    
    // ContractV2 배포 (업그레이드용)
    const ContractV2 = await ethers.getContractFactory("ContractV2");
    contractV2 = ContractV2;
  });

  describe("ContractV1", function () {
    it("Should initialize correctly", async function () {
      expect(await contractV1.getValue()).to.equal(0);
      expect(await contractV1.getName()).to.equal("ContractV1");
      expect(await contractV1.owner()).to.equal(owner.address);
    });

    it("Should set and get value", async function () {
      await contractV1.setValue(100);
      expect(await contractV1.getValue()).to.equal(100);
    });

    it("Should set and get name", async function () {
      await contractV1.setName("Test Contract");
      expect(await contractV1.getName()).to.equal("Test Contract");
    });

    it("Should emit events", async function () {
      await expect(contractV1.setValue(50))
        .to.emit(contractV1, "ValueUpdated")
        .withArgs(50);
      
      await expect(contractV1.setName("New Name"))
        .to.emit(contractV1, "NameUpdated")
        .withArgs("New Name");
    });
  });

  describe("Upgrade to ContractV2", function () {
    it("Should upgrade successfully", async function () {
      // 초기 값 설정
      await contractV1.setValue(42);
      await contractV1.setName("My Contract");
      
      // 업그레이드
      const upgraded = await upgrades.upgradeProxy(await contractV1.getAddress(), contractV2);
      await upgraded.waitForDeployment();
      
      // V2 초기화
      await upgraded.initializeV2();
      
      // 기존 값들이 유지되는지 확인
      expect(await upgraded.getValue()).to.equal(42);
      expect(await upgraded.getName()).to.equal("My Contract");
      expect(await upgraded.getCount()).to.equal(0);
    });

    it("Should have new V2 functionality", async function () {
      // 업그레이드
      const upgraded = await upgrades.upgradeProxy(await contractV1.getAddress(), contractV2);
      await upgraded.waitForDeployment();
      await upgraded.initializeV2();
      
      // 새로운 기능 테스트
      await upgraded.incrementCount();
      expect(await upgraded.getCount()).to.equal(1);
      
      await upgraded.incrementCount();
      expect(await upgraded.getCount()).to.equal(2);
      
      const [value, count] = await upgraded.getValueAndCount();
      expect(value).to.equal(0);
      expect(count).to.equal(2);
    });

    it("Should emit count events", async function () {
      const upgraded = await upgrades.upgradeProxy(await contractV1.getAddress(), contractV2);
      await upgraded.waitForDeployment();
      await upgraded.initializeV2();
      
      await expect(upgraded.incrementCount())
        .to.emit(upgraded, "CountIncremented")
        .withArgs(1);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to upgrade", async function () {
      await expect(
        upgrades.upgradeProxy(await contractV1.getAddress(), contractV2.connect(user1))
      ).to.be.reverted;
    });
  });
}); 