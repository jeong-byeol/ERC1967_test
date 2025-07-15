// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";

/**
 * @title CustomProxy
 * @dev UUPS 방식의 프록시 컨트랙트
 * 이 컨트랙트는 모든 호출을 구현체 컨트랙트로 위임합니다.
 */
contract CustomProxy is ERC1967Proxy {
    /**
     * @dev 생성자
     * @param _implementation 구현체 컨트랙트 주소
     * @param _data 초기화 데이터 (선택사항)
     */
    constructor(address _implementation, bytes memory _data) 
        ERC1967Proxy(_implementation, _data) 
    {}
    
    /**
     * @dev ETH 수신 함수
     */
    receive() external payable {
        // 프록시를 통해 구현체로 ETH 전달
        _fallback();
    }
    
    /**
     * @dev 현재 구현체 주소를 반환
     */
    function getImplementation() external view returns (address) {
        return _implementation();
    }
    
    /**
     * @dev 프록시의 관리자 주소를 반환 (ERC1967 슬롯에서)
     */
    function getAdmin() external view returns (address) {
        return ERC1967Utils.getAdmin();
    }

    
    /**
     * @dev 업그레이드 함수 (구현체에서만 호출 가능)
     */
    function upgradeToAndCall(address newImplementation, bytes memory data) external {
        // 이 함수는 구현체에서만 호출되어야 함
        require(msg.sender == _implementation(), "CustomProxy: caller must be implementation");
        ERC1967Utils.upgradeToAndCall(newImplementation, data);
    }
}
