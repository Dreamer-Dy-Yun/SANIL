# Mock API Data

## 역할

`frontend/src/api/mock/`는 백엔드 미구현 기간에 API 계약을 표현하는 mock 데이터 경계다.

## 폴더 역할

| 경로 | 역할 | 갱신 기준 |
|---|---|---|
| `fixtures/sanilFixtures.ts` | 제품, 기준 사진, 검사 이미지, finding, 이력 mock 데이터 | API 계약이나 데모 시나리오가 바뀔 때 |

## 경계 기준

- mock 데이터는 화면 코드에 작성하지 않는다.
- fixture는 adapter를 통해서만 화면에 전달한다.
- 백엔드가 제공하지 않을 값을 fixture 밖에서 생성해 UI에 주입하지 않는다.
