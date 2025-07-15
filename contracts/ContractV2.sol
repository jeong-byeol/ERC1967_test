// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./ContractV1.sol";

/**
 * @title ContractV2
 * @dev UUPS 방식의 구현체 컨트랙트 V2
 * ContractV1을 상속받아 새로운 기능을 추가합니다.
 */
contract ContractV2 is ContractV1 {
    // V1에서 추가된 변수
    uint256 public count;
    
    // 이벤트
    event CountIncremented(uint256 newCount);
    event V2Initialized();
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    /**
     * @dev V2 초기화 함수 (업그레이드 후 호출됨)
     */
    function initializeV2() public reinitializer(2) {
        count = 0;
        emit V2Initialized();
    }
    
    // V1에서 추가된 함수
    function incrementCount() public {
        count++;
        emit CountIncremented(count);
    }
    
    function getCount() public view returns (uint256) {
        return count;
    }
    
    // V2에서만 사용 가능한 새로운 기능
    function getValueAndCount() public view returns (uint256, uint256) {
        return (value, count);
    }
    
    /**
     * @dev 현재 구현체의 버전 정보 (V1에서 오버라이드)
     */
    function version() public pure override returns (string memory) {
        return "2.0.0";
    }
    
    /**
     * @dev 배치 작업 함수 (V2에서 추가)
     */
    function batchUpdate(uint256 _value, string memory _name) public {
        setValue(_value);
        setName(_name);
        incrementCount();
    }
}