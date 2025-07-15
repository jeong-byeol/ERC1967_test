# UUPS Proxy Contract Example

이 프로젝트는 OpenZeppelin의 UUPS (Universal Upgradeable Proxy Standard) 패턴을 사용한 업그레이드 가능한 스마트 컨트랙트 예제입니다.

## 프로젝트 구조

- `contracts/ContractV1.sol`: 초기 버전의 컨트랙트
- `contracts/ContractV2.sol`: 업그레이드된 버전의 컨트랙트 (V1에서 변수와 함수 각각 1개씩 추가)
- `scripts/deploy.js`: 프록시 배포 스크립트
- `scripts/upgrade.js`: 업그레이드 스크립트
- `test/UUPSProxy.test.js`: 테스트 파일

## ContractV1 기능

- `value`: uint256 타입의 상태 변수
- `name`: string 타입의 상태 변수
- `setValue(uint256)`: value 설정 함수
- `setName(string)`: name 설정 함수
- `getValue()`: value 조회 함수
- `getName()`: name 조회 함수

## ContractV2 추가 기능

- `count`: uint256 타입의 새로운 상태 변수 (V1에서 추가)
- `incrementCount()`: count를 증가시키는 새로운 함수 (V1에서 추가)
- `getCount()`: count 조회 함수
- `getValueAndCount()`: value와 count를 함께 반환하는 함수

## 설치 및 설정

```bash
npm install
```

## 테스트 실행

```bash
npx hardhat test
```

## 배포

### 로컬 네트워크에서 배포

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### 실제 네트워크에서 배포

환경 변수 설정:
```bash
echo "PRIVATE_KEY=your_private_key_here" > .env
```

배포:
```bash
npx hardhat run scripts/deploy.js --network kairos
```

## 업그레이드

배포 후 얻은 프록시 주소를 `scripts/upgrade.js`의 `proxyAddress` 변수에 설정한 후:

```bash
npx hardhat run scripts/upgrade.js --network kairos
```

## 주요 특징

1. **UUPS 패턴**: 구현체에 업그레이드 로직이 포함되어 있어 더 가볍고 유연함
2. **접근 제어**: `onlyOwner`를 통한 업그레이드 권한 제한
3. **상태 보존**: 업그레이드 시 기존 상태 변수들이 유지됨
4. **초기화 패턴**: `initializer`와 `reinitializer`를 사용한 안전한 초기화

## 보안 고려사항

- 업그레이드 권한은 소유자에게만 부여됨
- 구현체 컨트랙트는 `_disableInitializers()`로 잠김
- 스토리지 레이아웃 변경 시 주의 필요
