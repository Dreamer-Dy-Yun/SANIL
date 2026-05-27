# Frontend App Architecture

## 설계 방향

프론트엔드는 기능 경계 기준으로 나눈다.

화면, hook, component는 HTTP 또는 mock을 직접 호출하지 않는다. 모든 데이터 접근은 `src/api` 뒤에 둔다.

검사 세션은 DB의 `INSPECTION_SESSION.uuid`를 API의 `inspectionSessionUuid`로 노출해 사용한다.

## 권장 폴더 구조

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   ├── providers.tsx
│   └── compositionRoot.ts
├── api/
│   ├── contracts/
│   ├── client/
│   ├── adapters/
│   │   ├── http/
│   │   └── mock/
│   └── mock/
│       └── fixtures/
├── features/
│   ├── auth/
│   ├── products/
│   ├── reference-management/
│   ├── reference-guide/
│   ├── inspection-session/
│   ├── inspection-capture/
│   ├── inspection-processing/
│   ├── inspection-result/
│   └── inspection-history/
└── shared/
    ├── camera/
    ├── components/
    ├── hooks/
    ├── imaging/
    ├── routing/
    └── utils/
```

## 폴더 책임

| 경로 | 책임 |
|---|---|
| `app/` | composition root, router, provider 연결 |
| `api/contracts/` | request/response interface와 enum-like union |
| `api/client/` | `SanilApiClient` 생성 함수와 공통 에러 처리 |
| `api/adapters/http/` | 실제 백엔드 HTTP 구현 |
| `api/adapters/mock/` | API 계약을 구현하는 mock adapter |
| `api/mock/fixtures/` | mock 원천 데이터 |
| `features/*/` | 화면 단위 비즈니스 UI와 feature-local hook |
| `shared/camera/` | browser camera adapter interface와 구현 |
| `shared/scanner/` | 바코드/QR 촬영 및 제품 코드 디코딩 adapter interface와 구현 |
| `shared/imaging/` | ratio 좌표 변환, overlay 렌더링 보조 함수 |
| `shared/components/` | 도메인 비의존 UI |

## Feature 책임

| Feature | 책임 |
|---|---|
| `auth` | 로그인, 현재 사용자, 권한 표시 |
| `products` | 드롭다운 또는 바코드/QR 촬영 기반 제품 선택 |
| `reference-management` | 기준 사진 목록, 등록, 순서 관리 |
| `reference-guide` | 기준 사진 guide shape 표시/편집 |
| `inspection-session` | 검사 세션 생성과 전체 상태 조회 |
| `inspection-capture` | 단계형 QA 대상 촬영, 재촬영, 확정 |
| `inspection-processing` | 전체 촬영 완료 후 처리 상태 대기 |
| `inspection-result` | 최종 합부 상태와 근거 표시 |
| `inspection-history` | 과거 검사 목록과 상세 진입 |

## 의존성 주입 기준

- feature는 API client, camera adapter, scanner adapter, clock, uuid generator, logger를 직접 생성하지 않는다.
- `src/app/compositionRoot.ts`에서 실제 구현 또는 mock 구현을 조립한다.
- React context는 조립된 dependency 전달 용도로만 쓴다.
- 전역 mutable object나 service locator를 만들지 않는다.
- TanStack Query cache는 서버 상태 캐시로만 사용하고, 비즈니스 값을 새로 만들어 저장하지 않는다.

## 권장 패턴

| 패턴 | 적용 위치 |
|---|---|
| Factory | `createSanilApiClient`, `createCameraAdapter`, `createProductCodeScannerAdapter`, `createFrontendServices` |
| Adapter | HTTP/mock API, browser camera, barcode/QR scanner, image upload |
| Strategy | guide shape 렌더링 방식, 결과 표시 방식 |
| Repository-like client | API 계약 단위 client |
| State Machine | capture step UI 상태 전이 |

## Route 초안

| Route | 화면 |
|---|---|
| `/login` | 로그인 |
| `/products` | 제품 선택: 드롭다운 또는 바코드/QR 촬영 |
| `/products/:productUuid/references` | 기준 사진 목록과 인라인 등록 |
| 후속 | guide shape 편집 |
| `/inspections/new?productUuid=` | 검사 시작 |
| `/inspections/:inspectionSessionUuid/capture/:stepOrder` | 단계형 촬영 |
| `/inspections/:inspectionSessionUuid/processing` | 처리 대기 |
| `/inspections/:inspectionSessionUuid/result` | 최종 결과 |
| `/inspections/history` | 검사 이력 |

## 상태 관리 기준

- 서버/API 데이터와 UI 입력 상태를 분리한다.
- 촬영 프리뷰, 오버레이 표시, 버튼 활성화는 `inspection-capture` 내부 상태로 둔다.
- 검사 세션, 기준 사진, 처리 상태는 API 계약에서 받은 값만 사용한다.
- 백엔드 미제공 값을 프론트가 생성해 정상 데이터처럼 표시하지 않는다.

## 문서화 기준

각 feature는 구현 시 `README.md`를 가진다.

README에는 다음을 적는다.

- feature 책임
- 공개 component/hook
- 입력 데이터와 출력 이벤트
- API 계약
- 실패 상태
