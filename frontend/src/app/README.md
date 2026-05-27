# App Boundary

## 역할

`frontend/src/app/`는 앱 조립과 런타임 의존성 주입 경계다.

## 파일 역할

| 파일 | 역할 | 갱신 기준 |
|---|---|---|
| `App.tsx` | 인증 bootstrap, 라우팅, 로그인/업무 화면 전환 | 라우트, 인증 초기화, 오류 노출 방식이 바뀔 때 |
| `FrontendServicesProvider.tsx` | services를 React context로 제공 | provider 구조가 바뀔 때 |
| `serviceContext.ts` | services context와 hook | 주입 contract가 바뀔 때 |
| `serviceFactory.ts` | env 기반 API mode, camera adapter, scanner adapter 생성 | 런타임 mode, adapter 생성 정책이 바뀔 때 |
| `serviceTypes.ts` | 앱에 주입되는 service interface | service 종류나 공개 계약이 바뀔 때 |

## 경계 기준

- service를 전역 singleton으로 export하지 않는다.
- 화면은 `useFrontendServices()`로 계약만 사용한다.
- 제품 코드 스캔은 `ProductCodeScannerAdapter` 뒤에 두고 화면에서 디코더 구현을 직접 호출하지 않는다.
- API 오류는 로그인 없음으로 보정하지 않고, `auth` 오류만 로그인 화면으로 보낸다.
