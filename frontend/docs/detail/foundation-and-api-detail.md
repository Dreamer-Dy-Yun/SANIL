# Foundation and API Detail

## 문서 목적

이 문서는 프론트엔드 foundation 계층의 상세 설계 기준이다.

대상은 composition root, dependency injection, `SanilApiClient`, HTTP/mock adapter, `ApiError` 정규화, mock fixture 경계다. 이 문서는 구현 코드가 아니라 향후 구현자가 따라야 할 계약 문서다.

## 참조 기준

- `frontend/docs/frontend-design.md`
- `frontend/docs/app-architecture.md`
- `frontend/docs/api-contract.md`
- `frontend/docs/mock-boundary.md`
- `docs/project/dependency-injection-and-patterns.md`
- `docs/project/implementation-principles.md`

## 핵심 불변식

- 화면, component, hook은 HTTP 구현이나 mock fixture를 직접 import하지 않는다.
- 모든 API 접근은 `SanilApiClient` 계약 뒤에서 수행한다.
- HTTP adapter와 mock adapter는 같은 `SanilApiClient` interface를 구현한다.
- DB의 `INSPECTION_SESSION.uuid`는 프론트 API에서 항상 `inspectionSessionUuid`로 노출한다.
- API 실패는 빈 배열, 빈 객체, 성공 상태, 임의 기본값으로 바꾸지 않는다.
- 백엔드가 제공하지 않은 비즈니스 값은 프론트에서 생성하지 않는다.
- 전역 mutable object, 전역 API client singleton, service locator는 만들지 않는다.
- React context는 조립된 dependency 전달 용도로만 사용한다.
- mock fixture는 `src/api/mock/fixtures/` 경계 안에만 둔다.

## 책임 경계

| 영역 | 책임 | 금지 |
|---|---|---|
| `src/app/compositionRoot.ts` | runtime config를 읽고 실제 dependency를 조립한다. | 화면별 비즈니스 판단, API 응답 보정 |
| `src/app/providers.tsx` | 조립된 dependency를 React tree에 주입한다. | provider 내부에서 HTTP/mock 직접 분기 남용 |
| `src/api/contracts/` | request/response interface, status union, `ApiError` 계약을 둔다. | adapter 구현 세부, fixture 데이터 |
| `src/api/client/` | `SanilApiClient` 공개 계약과 client factory 계약을 둔다. | 화면용 fallback, mock 원천 데이터 |
| `src/api/adapters/http/` | 백엔드 HTTP 호출을 `SanilApiClient`로 변환한다. | 백엔드 미제공 값 생성, 실패 은닉 |
| `src/api/adapters/mock/` | fixture 기반 대체 구현체를 `SanilApiClient`로 제공한다. | component 친화용 데이터 생성 |
| `src/api/mock/fixtures/` | mock 원천 데이터와 오류 시나리오 fixture를 둔다. | adapter behavior, 화면 상태 |
| `features/*` | 화면 단위 UI, feature-local hook, state machine을 둔다. | HTTP/mock 직접 호출, fixture import |

## Dependency Graph

```text
app/compositionRoot
  -> api/client/createSanilApiClient
    -> api/adapters/http/createHttpSanilApiClient
    -> api/adapters/mock/createMockSanilApiClient
      -> api/mock/fixtures
  -> shared/camera/createCameraAdapter
  -> app/providers
    -> features/*
```

`features/*`는 위 그래프를 역방향으로 참조하지 않는다. feature는 context나 명시적 service factory를 통해 `SanilApiClient`, camera adapter, clock, logger를 주입받는다.

## Runtime Config Contract

### `FrontendRuntimeMode`

```ts
export type FrontendRuntimeMode = "http" | "mock";
```

| 항목 | 계약 |
|---|---|
| 입력 | 환경 변수 또는 bootstrap 설정에서 결정된 문자열 |
| 출력 | HTTP adapter 또는 mock adapter 선택 기준 |
| 부작용 | 없음 |
| 실패 | 허용되지 않은 값이면 앱 bootstrap 단계에서 설정 오류로 처리 |
| 금지 | 알 수 없는 값을 자동으로 `mock` 또는 `http`로 대체하지 않는다. |

### `FrontendRuntimeConfig`

```ts
export interface FrontendRuntimeConfig {
  mode: FrontendRuntimeMode;
  apiBaseUrl: string | null;
}
```

| 항목 | 계약 |
|---|---|
| 입력 | Vite env, 배포 설정, 테스트 setup에서 주입된 값 |
| 출력 | composition root가 사용할 immutable config |
| 부작용 | 없음 |
| 실패 | `mode: "http"`인데 `apiBaseUrl`이 비어 있으면 설정 오류 |
| 금지 | 설정 누락을 화면용 mock 데이터로 우회하지 않는다. |

## Composition Root Contract

### `createFrontendServices`

```ts
export interface CreateFrontendServicesOptions {
  config: FrontendRuntimeConfig;
  clock: Clock;
  logger: Logger;
  cameraAdapter: CameraAdapter;
  httpTransport?: HttpTransport;
  fixtureSource?: MockFixtureSource;
}

export interface FrontendServices {
  apiClient: SanilApiClient;
  cameraAdapter: CameraAdapter;
  productCodeScannerAdapter: ProductCodeScannerAdapter;
  clock: Clock;
  logger: Logger;
}

export function createFrontendServices(
  options: CreateFrontendServicesOptions,
): FrontendServices;
```

| 항목 | 계약 |
|---|---|
| 입력 | runtime config, clock, logger, camera adapter, 선택적 HTTP transport 또는 fixture source |
| 출력 | React provider에 전달할 조립 완료 dependency 묶음 |
| 부작용 | 객체 생성과 dependency 연결만 수행한다. 생성 시 네트워크 요청, 카메라 권한 요청, fixture mutation은 하지 않는다. |
| 실패 | config가 불완전하거나 mode별 필수 dependency가 없으면 bootstrap 설정 오류를 던진다. |
| 금지 | service locator 생성, 전역 singleton 저장, feature별 비즈니스 판단, API 응답 보정 |

`createFrontendServices`는 앱에서 구체 구현체를 선택하는 유일한 지점이다. feature 코드가 `createHttpSanilApiClient` 또는 `createMockSanilApiClient`를 직접 호출하면 경계 위반으로 본다.

### `FrontendServicesProvider`

```ts
export interface FrontendServicesProviderProps {
  services: FrontendServices;
  children: React.ReactNode;
}
```

| 항목 | 계약 |
|---|---|
| 입력 | `createFrontendServices`가 만든 immutable service 묶음 |
| 출력 | React tree에서 사용할 dependency context |
| 부작용 | React context 제공 외 없음 |
| 실패 | provider 밖에서 dependency hook이 호출되면 명시적 설정 오류를 던진다. |
| 금지 | provider 내부에서 mode를 다시 판별하거나 API client를 재생성하지 않는다. |

## SanilApiClient Contract

`SanilApiClient`는 화면이 참조하는 유일한 API 계약이다. public method는 `frontend/docs/api-contract.md`의 request/response interface를 그대로 사용한다.

```ts
export interface SanilApiClient {
  login(request: LoginRequest): Promise<CurrentUser>;
  getCurrentUser(): Promise<CurrentUser>;
  listProducts(): Promise<ProductSummary[]>;
  findProductByCode(productCode: string): Promise<ProductSummary>;
  listReferenceShots(productUuid: Uuid): Promise<ReferenceShot[]>;
  createReferenceShot(request: CreateReferenceShotRequest): Promise<ReferenceShot>;
  updateReferenceGuideShape(request: UpdateReferenceGuideShapeRequest): Promise<ReferenceShot>;
  createInspectionSession(productUuid: Uuid): Promise<InspectionSession>;
  getInspectionSession(inspectionSessionUuid: Uuid): Promise<InspectionSession>;
  getInspectionCaptureStep(
    inspectionSessionUuid: Uuid,
    stepOrder: number,
  ): Promise<InspectionCaptureStep>;
  confirmInspectionCapture(
    request: ConfirmInspectionCaptureRequest,
  ): Promise<ConfirmInspectionCaptureResponse>;
  getInspectionResult(inspectionSessionUuid: Uuid): Promise<InspectionResultSummary>;
}
```

### 공통 method 규칙

| 항목 | 계약 |
|---|---|
| 입력 | API contract에 정의된 request interface와 path 식별자 |
| 출력 | API contract에 정의된 response interface Promise |
| 부작용 | 조회 method는 서버 상태 변경 없음. 생성, 수정, 촬영 확정 method는 백엔드 또는 mock adapter의 명시된 저장소에만 영향을 준다. |
| 실패 | 모든 실패는 `ApiError` shape로 reject한다. 알 수 없는 오류도 adapter boundary에서 `ApiError`로 정규화한다. |
| 금지 | 실패를 성공 응답으로 변환, 누락 필드 기본값 주입, enum 값 재해석, 화면 편의용 필드 추가 |

### Method별 상세 계약

| Method | 입력 | 출력 | 부작용 | 실패 | 금지 |
|---|---|---|---|---|---|
| `login` | `LoginRequest` | `CurrentUser` | HTTP는 서버 세션 또는 쿠키 정책을 따른다. mock은 생성된 mock client 내부 인증 상태만 바꾼다. | `auth`, `validation`, `network`, `server` | current user 전역 객체 저장, 임의 관리자 승격 |
| `getCurrentUser` | 없음 | `CurrentUser` | 없음 | `auth`, `permission`, `network`, `server` | 인증 실패를 anonymous user로 대체 |
| `listProducts` | 없음 | `ProductSummary[]` | 없음 | `auth`, `permission`, `network`, `server` | `referenceCount` 임의 계산 |
| `findProductByCode` | 제품 코드 문자열 | `ProductSummary` | 없음 | `validation`, `not_found`, `network`, `server` | 스캔 문자열을 화면에서 임의 제품으로 보정 |
| `listReferenceShots` | `productUuid` | `ReferenceShot[]` | 없음 | `validation`, `not_found`, `network`, `server` | image 또는 guideShape 누락을 임의 객체로 보정 |
| `createReferenceShot` | `CreateReferenceShotRequest` | `ReferenceShot` | 이미지 업로드와 기준 사진 생성 | `validation`, `conflict`, `network`, `server` | 업로드 실패 후 성공 reference 반환 |
| `updateReferenceGuideShape` | `UpdateReferenceGuideShapeRequest` | `ReferenceShot` | guide shape 저장 | `validation`, `not_found`, `conflict`, `network`, `server` | ratio 좌표를 pixel 좌표로 저장 |
| `createInspectionSession` | `productUuid` | `InspectionSession` | 검사 세션 생성 | `validation`, `not_found`, `conflict`, `network`, `server` | session uuid를 프론트에서 생성해 성공처럼 표시 |
| `getInspectionSession` | `inspectionSessionUuid` | `InspectionSession` | 없음 | `not_found`, `network`, `server` | `capturedSteps`, `totalSteps` 임의 계산 |
| `getInspectionCaptureStep` | `inspectionSessionUuid`, `stepOrder` | `InspectionCaptureStep` | 없음 | `validation`, `not_found`, `network`, `server` | 누락 reference를 placeholder로 대체 |
| `confirmInspectionCapture` | `ConfirmInspectionCaptureRequest` | `ConfirmInspectionCaptureResponse` | 이미지 저장, 촬영 확정, 비교 queue 등록 요청 | `validation`, `not_found`, `conflict`, `network`, `server` | 비교 실패를 합격/불합격으로 변환 |
| `getInspectionResult` | `inspectionSessionUuid` | `InspectionResultSummary` | 없음 | `not_found`, `conflict`, `network`, `server` | 처리 중 결과를 임의 final result로 생성 |

## API Client Factory Contract

### `createSanilApiClient`

```ts
export interface CreateSanilApiClientOptions {
  mode: FrontendRuntimeMode;
  http?: CreateHttpSanilApiClientOptions;
  mock?: CreateMockSanilApiClientOptions;
}

export function createSanilApiClient(
  options: CreateSanilApiClientOptions,
): SanilApiClient;
```

| 항목 | 계약 |
|---|---|
| 입력 | runtime mode와 mode별 adapter 생성 옵션 |
| 출력 | `SanilApiClient` 구현체 |
| 부작용 | 없음. adapter 객체만 생성한다. |
| 실패 | mode에 필요한 옵션이 없거나 중복 설정이 충돌하면 설정 오류 |
| 금지 | mode별 응답 shape 차이 생성, adapter 선택 후 응답 보정 |

Factory는 구현체 선택만 담당한다. 인증 정책, 제품 권한, 검사 상태 판단 같은 비즈니스 규칙은 factory가 수행하지 않는다.

## HTTP Adapter Contract

### `HttpTransport`

```ts
export interface HttpTransport {
  request<TResponse>(request: HttpRequest): Promise<HttpResponse<TResponse>>;
}
```

| 항목 | 계약 |
|---|---|
| 입력 | method, url, headers, body, query, credentials 정책을 포함한 HTTP request |
| 출력 | status, headers, parsed body를 포함한 HTTP response |
| 부작용 | 실제 네트워크 요청 |
| 실패 | 네트워크 단절, timeout, abort, body parse 실패 |
| 금지 | API contract의 비즈니스 필드 생성 또는 정규화 |

### `createHttpSanilApiClient`

```ts
export interface CreateHttpSanilApiClientOptions {
  baseUrl: string;
  transport: HttpTransport;
  normalizeError: ApiErrorNormalizer;
}

export function createHttpSanilApiClient(
  options: CreateHttpSanilApiClientOptions,
): SanilApiClient;
```

| 항목 | 계약 |
|---|---|
| 입력 | 백엔드 base URL, transport, error normalizer |
| 출력 | HTTP 기반 `SanilApiClient` |
| 부작용 | method 호출 시에만 HTTP 요청 발생 |
| 실패 | HTTP status 오류, network 오류, 응답 body 계약 불일치 |
| 금지 | 생성 시 health check 자동 호출, 실패 fallback, mock fixture 참조 |

HTTP adapter는 path 구성, query 구성, multipart 구성, response body parsing까지만 책임진다. 서버에서 확정한 enum 값은 과도하게 변환하지 않는다. 필수 필드가 없으면 계약 불일치로 `ApiError.kind: "server"` 또는 명시된 validation error로 reject한다.

## Mock Adapter Contract

### `MockFixtureSource`

```ts
export interface MockFixtureSource {
  products: readonly ProductSummary[];
  references: readonly ReferenceShot[];
  inspectionSessions: readonly InspectionSession[];
  captureSteps: readonly InspectionCaptureStep[];
  results: readonly InspectionResultSummary[];
  currentUser: CurrentUser | null;
}
```

| 항목 | 계약 |
|---|---|
| 입력 | API response shape와 동일한 readonly fixture 묶음 |
| 출력 | mock adapter 초기 상태의 원천 데이터 |
| 부작용 | 없음 |
| 실패 | 필수 fixture 누락 시 mock client 생성 실패 |
| 금지 | component나 hook에서 직접 import, 화면별 임시 데이터 포함 |

### `createMockSanilApiClient`

```ts
export interface CreateMockSanilApiClientOptions {
  fixtureSource: MockFixtureSource;
  clock: Clock;
  uuidGenerator: UuidGenerator;
  logger: Logger;
}

export function createMockSanilApiClient(
  options: CreateMockSanilApiClientOptions,
): SanilApiClient;
```

| 항목 | 계약 |
|---|---|
| 입력 | fixture source, clock, uuid generator, logger |
| 출력 | mock 기반 `SanilApiClient` |
| 부작용 | 생성된 mock client 내부의 in-memory state만 변경 가능 |
| 실패 | fixture에 필요한 product/reference/session이 없으면 `not_found` 또는 설정 오류 |
| 금지 | 화면 편의를 위한 누락 필드 보정, fixture 외부 전역 배열 mutation, localStorage 저장 |

mock adapter는 백엔드가 아직 없을 때의 대체 구현체다. 단순 임시 데이터가 아니라 `SanilApiClient` 계약을 검증하기 위한 구현체로 취급한다.

mock adapter가 생성/수정 method를 지원할 때는 다음을 지킨다.

- 생성된 값은 API contract에 필요한 최소 범위에서만 만든다.
- `uuidGenerator`와 `clock`은 composition root에서 주입받는다.
- 생성 결과가 fixture 계약과 충돌하면 `conflict` 또는 `validation`으로 실패한다.
- 앱 새로고침 뒤에도 유지되는 저장을 제공하려면 별도 계약과 문서를 먼저 추가한다.

## ApiError Contract

`ApiError`의 public shape는 `frontend/docs/api-contract.md`를 따른다.

```ts
export type ApiErrorKind =
  | "auth"
  | "permission"
  | "validation"
  | "not_found"
  | "conflict"
  | "server"
  | "network";

export interface ApiError {
  kind: ApiErrorKind;
  message: string;
  detail?: unknown;
}
```

### `ApiErrorNormalizer`

```ts
export interface ApiErrorNormalizer {
  normalize(error: unknown): ApiError;
}
```

| 항목 | 계약 |
|---|---|
| 입력 | HTTP status error, network error, parse error, unknown thrown value |
| 출력 | `ApiError` |
| 부작용 | 없음 |
| 실패 | normalizer는 throw하지 않는다. 정규화 불가 오류는 `kind: "server"`로 반환한다. |
| 금지 | error를 성공 응답으로 변환, 사용자 업무용 기본 데이터 반환 |

### HTTP status mapping

| 조건 | `ApiError.kind` |
|---|---|
| 401 | `auth` |
| 403 | `permission` |
| 400, 422 | `validation` |
| 404 | `not_found` |
| 409 | `conflict` |
| 500 이상 | `server` |
| response 없음, offline, timeout | `network` |
| JSON parse 실패, 계약 불일치 | `server` |

`message`는 사용자에게 표시 가능한 수준의 요약이어야 한다. `detail`에는 디버깅 정보를 둘 수 있지만 토큰, 비밀번호, 원본 파일 binary, 민감한 header는 포함하지 않는다.

## Fixture Boundary

fixture는 mock adapter의 입력 데이터이며 화면 표시용 샘플 코드가 아니다.

| 파일 유형 | 허용 내용 | 금지 |
|---|---|---|
| `src/api/mock/fixtures/products.*` | `ProductSummary[]` 원천 데이터 | 화면 전용 label 조합 |
| `src/api/mock/fixtures/references.*` | `ReferenceShot[]`, guide shape | pixel 기반 좌표 저장 |
| `src/api/mock/fixtures/inspectionSessions.*` | `InspectionSession[]` | `inspectionSessionUuid` 외 session 식별자 혼용 |
| `src/api/mock/fixtures/captureSteps.*` | `InspectionCaptureStep[]` | 누락 reference placeholder |
| `src/api/mock/fixtures/results.*` | `InspectionResultSummary[]` | 처리 중인데 final result 생성 |
| `src/api/mock/fixtures/errors.*` | 명시적 실패 시나리오 | 실패를 성공으로 바꾸는 fallback |

fixture 작성 규칙은 다음과 같다.

- API contract와 같은 property 이름을 사용한다.
- `inspectionSessionUuid` 명칭을 유지한다.
- ratio 좌표는 `origin: "top_left"`, `unit: "ratio"`를 유지한다.
- fixture가 비어 있는 경우 화면은 빈 상태 또는 명시적 오류 상태를 보여야 한다.
- mock fixture가 백엔드 계약 미확정 영역을 대신하면 해당 미확정 사항을 문서에 남긴다.

## Query and Feature Usage Boundary

feature hook은 다음 방식으로만 API를 사용한다.

```ts
const { apiClient } = useFrontendServices();
```

| 항목 | 계약 |
|---|---|
| 입력 | provider가 주입한 `SanilApiClient` |
| 출력 | TanStack Query 또는 mutation 결과 |
| 부작용 | query/mutation 호출에 따른 API method 실행 |
| 실패 | `ApiError`를 UI 상태로 노출 |
| 금지 | adapter 직접 import, fixture 직접 import, catch 후 빈 데이터 반환 |

TanStack Query cache는 서버 상태 캐시다. cache에 화면 편의를 위한 계산값을 API 값처럼 저장하지 않는다. 필요한 파생 값은 component 렌더링 단계나 feature-local selector에서 명시적으로 계산하되 API contract 값으로 오해되지 않게 한다.

## Logging Boundary

`Logger`는 adapter와 composition root에 주입한다.

```ts
export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}
```

| 항목 | 계약 |
|---|---|
| 입력 | message와 안전한 context |
| 출력 | 없음 |
| 부작용 | console, remote logging, test spy 등 주입된 구현체에 따른 기록 |
| 실패 | logging 실패가 API 실패나 UI 실패를 덮지 않는다. |
| 금지 | 비밀번호, token, 원본 이미지 binary, 민감한 header 기록 |

## Clock and UUID Boundary

`Clock`과 `UuidGenerator`는 mock adapter와 capture request 조립에 필요한 경우 주입한다.

```ts
export interface Clock {
  nowIso(): IsoDateTimeString;
}

export interface UuidGenerator {
  create(): Uuid;
}
```

| 항목 | 계약 |
|---|---|
| 입력 | 없음 |
| 출력 | 현재 시각 문자열 또는 UUID 문자열 |
| 부작용 | 없음 |
| 실패 | 테스트 대체 구현체가 잘못된 값을 반환하면 validation error로 드러낸다. |
| 금지 | module import 시점에 값 생성, 전역 mutable counter 노출 |

HTTP mode에서 서버가 생성해야 하는 `inspectionSessionUuid`, `inspectedUuid`, `imageUuid`는 프론트가 생성하지 않는다. mock mode의 uuid 생성은 대체 구현체 내부 상태를 구성하기 위한 것으로 한정한다.

## 금지 사례

- `features/products`에서 `src/api/adapters/mock` 또는 `src/api/mock/fixtures`를 import한다.
- `catch`에서 `[]`, `null`, `{ status: "PASSED" }` 같은 성공형 fallback을 반환한다.
- HTTP 응답의 `FAILED`를 화면 편의상 `NG`로 바꿔 API 값처럼 저장한다.
- `inspectionSessionUuid` 대신 `sessionId`, `inspectionUuid`, `INSPECTION_SESSION.uuid`를 화면 route나 feature state에 혼용한다.
- `createFrontendServices` 밖에서 mode에 따라 HTTP/mock 구현체를 선택한다.
- mock adapter가 백엔드에 없는 `referenceCount`, `capturedSteps`, `summary`를 임의로 채워 계약 불일치를 숨긴다.

## 구현 시 검증 체크리스트

- `SanilApiClient` public method가 `frontend/docs/api-contract.md`와 일치하는가.
- HTTP adapter와 mock adapter가 같은 interface를 구현하는가.
- 모든 adapter 실패가 `ApiError`로 reject되는가.
- 401과 403이 각각 `auth`, `permission`으로 분리되는가.
- mock fixture가 component, hook, page에 직접 import되지 않는가.
- `inspectionSessionUuid` 명칭이 route, API, feature state에서 일관되는가.
- composition root 밖에서 service를 생성하거나 mode를 분기하지 않는가.
- module import 시 네트워크, 카메라 권한 요청, fixture mutation이 발생하지 않는가.
- API 실패를 빈 데이터 또는 성공 상태로 덮는 fallback이 없는가.

## 미확정 항목

- backend endpoint path, multipart field name, cookie/session 정책은 백엔드 계약 확정 시 `frontend/docs/api-contract.md`와 이 문서를 함께 갱신해야 한다.
- `INSPECTED.result`의 DB 저장 형식은 미확정이다. 프론트 API 표시 계약은 현재 `findings: InspectionFinding[]`를 기준으로 유지한다.
- mock state를 브라우저 reload 후 유지할지는 MVP 범위 밖이다. 필요하면 storage adapter 계약을 별도 설계한다.
