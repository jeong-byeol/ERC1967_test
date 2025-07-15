// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ContractV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    // 상태 변수
    uint256 public value;
    string public name;
    
    // 이벤트
    event ValueUpdated(uint256 newValue);
    event NameUpdated(string newName);
    event ContractUpgraded(address indexed newImplementation);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        value = 0;
        name = "ContractV1";
    }
    
    // 기본 함수들
    function setValue(uint256 _value) public {
        value = _value;
        emit ValueUpdated(_value);
    }
    
    function setName(string memory _name) public {
        name = _name;
        emit NameUpdated(_name);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
    
    function getName() public view returns (string memory) {
        return name;
    }
    
    /**
     * @dev 업그레이드 권한 확인 (UUPSUpgradeable에서 오버라이드)
     * @param newImplementation 새로운 구현체 주소
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        emit ContractUpgraded(newImplementation);
    }
    
    /**
     * @dev 현재 구현체의 버전 정보
     */
    function version() public pure virtual returns (string memory) {
        return "1.0.0";
    }
}
