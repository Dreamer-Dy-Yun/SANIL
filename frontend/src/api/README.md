# API Boundary

## 역할

`frontend/src/api/`는 화면과 데이터 출처 사이의 단일 경계다.

## 파일 역할

| 경로 | 역할 | 갱신 기준 |
|---|---|---|
| `contracts.ts` | API 입력/출력 interface와 enum-like 타입 | 백엔드 계약 또는 화면 필요 데이터가 바뀔 때 |
| `errors.ts` | API 실패 종류와 오류 정규화 | 오류 종류, 메시지 처리 정책이 바뀔 때 |
| `client.ts` | runtime mode에 따른 adapter factory | adapter 선택 정책이 바뀔 때 |
| `adapters/http/` | HTTP API adapter | 실제 백엔드 endpoint 계약이 확정될 때 |
| `adapters/mock/` | fixture 기반 mock adapter | mock 동작이나 대체 구현 contract가 바뀔 때 |
| `mock/fixtures/` | mock 업무 데이터 | API 계약을 표현하는 mock 데이터가 바뀔 때 |

## 경계 기준

- 컴포넌트, hook, feature 화면은 fixture를 직접 import하지 않는다.
- mock은 같은 `SanilApiClient` contract를 구현한다.
- HTTP adapter가 준비되지 않은 API를 mock으로 우회하지 않는다.
- API 실패를 빈 배열, 성공 상태, 임의 기본값으로 바꾸지 않는다.
