# 검사 세션/촬영 상세 설계

## 문서 목적

`INSPECTION_SESSION.uuid` 기반 검사 세션 생성부터 단계형 QA 대상 촬영, 카메라 제어, 촬영 확정 API 호출까지의 프론트 상세 계약을 정의한다.

이 문서는 코드 구현 지시가 아니라 향후 구현 시 지켜야 할 책임 경계와 함수/클래스/interface 계약이다.

## 참조 기준

- 세션 식별자는 API에서 `inspectionSessionUuid`로 쓰며 DB의 `INSPECTION_SESSION.uuid`에 매핑한다.
- 촬영 단계는 `stepOrder`와 `referenceUuid`를 함께 사용해 기준 사진과 QA 대상 사진의 매핑을 고정한다.
- 최종 합부 결과는 모든 필수 촬영이 끝난 뒤에만 표시한다.
- 촬영 화면에서는 개별 판정, finding, `FindingJudge`를 노출하지 않는다.
- `M86XE` 계열 태블릿을 1차 촬영 장비 제약으로 보되 OS, 브라우저, 카메라 세부 사양은 실기 확인 전 임의 확정하지 않는다.

## 범위

포함 범위:

- 검사 세션 생성 흐름
- 단계형 촬영 화면의 데이터 로딩과 이동 흐름
- `CameraAdapter` 계약
- `CaptureState` state machine 계약
- `CaptureStepController` 계약
- `confirmInspectionCapture` API 계약
- 촬영 실패, 권한 실패, API 실패를 성공처럼 숨기지 않는 기준

제외 범위:

- 기준 사진 등록/수정
- guide shape 편집
- 최종 결과 화면의 상세 표시
- 검사 이력 화면
- 실제 React 컴포넌트/훅/서비스 코드 구현

## 제안 폴더/파일 책임

| 영역 | 책임 | 금지 경계 |
|---|---|---|
| `src/features/inspection-session` | 세션 생성, 세션 상태 조회, 촬영 시작 route 결정 | 카메라 직접 제어, 개별 판정 표시 |
| `src/features/inspection-capture` | 한 단계 촬영, 재촬영, 확정, 다음 단계 이동 | API/mock 직접 분기, 최종 판정 표시 |
| `src/shared/camera` | 브라우저/앱 래퍼 카메라 구현을 숨기는 adapter 계약 | 검사 세션/제품/판정 업무 규칙 |
| `src/api` | `SanilApiClient` interface와 HTTP/mock adapter | 화면 상태와 DOM 직접 제어 |
| `src/api/mock` | 같은 API 계약을 구현하는 대체 구현체와 fixture | 화면 편의용 합격/불합격 생성 |

컴포넌트, page, hook은 HTTP client, mock fixture, `navigator.mediaDevices`를 직접 호출하지 않는다.

## 핵심 데이터 불변 조건

| 값 | 소유권 | 규칙 |
|---|---|---|
| `inspectionSessionUuid` | 백엔드/API | 프론트가 생성하지 않는다. URL과 API 호출 식별자로만 사용한다. |
| `referenceUuid` | 백엔드/API | 현재 단계 기준 사진 식별자다. 촬영 확정 시 반드시 함께 보낸다. |
| `stepOrder` | 백엔드/API | 기준 사진 촬영 순서다. 프론트가 재정렬하거나 누락 보정하지 않는다. |
| `totalSteps` | 백엔드/API | 최종 결과 접근 가능 여부 판단의 기준이다. 프론트에서 임의 계산하지 않는다. |
| `capturedSteps` | 백엔드/API | 진행률 표시용이다. 로컬 확정 성공 전 선반영하지 않는다. |
| `comparisonStatus` | 백엔드/API | 촬영 처리 상태 표시만 허용한다. 합부 판정으로 해석하지 않는다. |

## 세션 생성 흐름

1. 제품 선택 화면에서 사용자가 검사 시작을 요청한다.
2. 프론트는 `createInspectionSession(productUuid)`만 호출한다.
3. 백엔드는 필수 기준 사진 존재 여부, 권한, 세션 생성 가능 상태를 검증한다.
4. 성공 응답의 `inspectionSessionUuid`와 `totalSteps`를 기준으로 `/inspections/:inspectionSessionUuid/capture/1`로 이동한다.
5. 세션 생성 실패는 빈 세션이나 로컬 임시 세션으로 대체하지 않는다.

### `createInspectionSession` 계약

```ts
createInspectionSession(productUuid: Uuid): Promise<InspectionSession>
```

| 항목 | 계약 |
|---|---|
| 입력 | `productUuid`: 사용자가 선택한 제품의 `PRODUCT.uuid` |
| 출력 | 생성된 `InspectionSession`. `inspectionSessionUuid`, `status`, `totalSteps`, `capturedSteps` 포함 |
| 부작용 | 백엔드가 `INSPECTION_SESSION`을 생성하고 촬영자/생성 시각을 감사 정보로 남긴다. 프론트는 성공 시 capture route로 이동한다. |
| 실패 | `auth`, `permission`, `validation`, `not_found`, `conflict`, `server`, `network`를 그대로 드러낸다. 필수 기준 사진 누락은 성공 세션으로 위장하지 않는다. |
| 금지 | 프론트에서 `inspectionSessionUuid`, `round`, `totalSteps`, `capturedSteps`를 생성하거나 보정하지 않는다. |

## 단계형 촬영 흐름

촬영 화면 route는 `/inspections/:inspectionSessionUuid/capture/:stepOrder`를 사용한다.

1. route param에서 `inspectionSessionUuid`, `stepOrder`를 읽는다.
2. `getInspectionSession(inspectionSessionUuid)`로 세션 상태를 조회한다.
3. `getInspectionCaptureStep(inspectionSessionUuid, stepOrder)`로 현재 기준 사진, guide shape, 기존 촬영 상태를 조회한다.
4. 카메라 preview는 `CameraAdapter`를 통해 시작한다.
5. 사용자는 촬영 후 preview 이미지를 확인한다.
6. 사용자가 촬영 확정을 누르면 `confirmInspectionCapture`를 호출한다.
7. 확정 성공 후에는 `comparisonStatus`만 표시하고, 개별 판정은 표시하지 않는다.
8. 다음 단계가 있으면 다음 capture route로 이동한다. 모든 단계가 끝나면 processing route로 이동한다.

### `getInspectionCaptureStep` 계약

```ts
getInspectionCaptureStep(
  inspectionSessionUuid: Uuid,
  stepOrder: number,
): Promise<InspectionCaptureStep>
```

| 항목 | 계약 |
|---|---|
| 입력 | `inspectionSessionUuid`, `stepOrder` |
| 출력 | `InspectionCaptureStep`: `reference`, `inspected`, `comparisonStatus` 포함 |
| 부작용 | 없음. 조회 전용이다. |
| 실패 | 세션 없음, 단계 없음, 권한 없음, 네트워크 실패를 명시 오류로 표시한다. |
| 금지 | `reference`가 없을 때 프론트에서 임시 기준 사진이나 임시 단계 데이터를 만들지 않는다. |

## 카메라 adapter 계약

카메라 제어는 `CameraAdapter` 뒤에 둔다. 브라우저 `getUserMedia`, 향후 앱 래퍼, 네이티브 bridge는 이 interface 구현체 안에서만 다룬다.

```ts
export interface CameraAdapter {
  getPermissionState(): Promise<CameraPermissionState>;
  requestPermission(request: CameraPermissionRequest): Promise<CameraPermissionState>;
  startPreview(request: StartCameraPreviewRequest): Promise<CameraPreviewSession>;
  captureFrame(session: CameraPreviewSession, options: CaptureFrameOptions): Promise<CapturedImage>;
  stopPreview(session: CameraPreviewSession): Promise<void>;
}
```

### 관련 interface 계약

```ts
export type CameraPermissionState =
  | "prompt"
  | "granted"
  | "denied"
  | "unsupported";

export interface CameraPermissionRequest {
  preferredFacingMode: "environment";
}

export interface StartCameraPreviewRequest {
  preferredFacingMode: "environment";
  minWidth?: number;
  minHeight?: number;
}

export interface CameraPreviewSession {
  sessionId: string;
  stream: MediaStream;
  startedAt: IsoDateTimeString;
  deviceLabel: string | null;
}

export interface CaptureFrameOptions {
  mimeType: "image/jpeg" | "image/png";
  quality?: number;
}

export interface CapturedImage {
  imageFile: File;
  capturedAt: IsoDateTimeString;
  width: number;
  height: number;
  mimeType: string;
}

export type CameraErrorKind =
  | "permission_denied"
  | "unsupported"
  | "device_not_found"
  | "device_busy"
  | "stream_ended"
  | "capture_failed"
  | "unknown";

export interface CameraError {
  kind: CameraErrorKind;
  message: string;
  cause?: unknown;
}
```

| 함수 | 입력 | 출력 | 부작용 | 실패 | 금지 |
|---|---|---|---|---|---|
| `getPermissionState` | 없음 | 현재 권한 상태 | 없음 | 권한 API 미지원 시 `unsupported` | 권한 prompt를 발생시키지 않는다. |
| `requestPermission` | 후면 카메라 선호 조건 | 권한 상태 | 브라우저 권한 prompt 가능 | 거부, 미지원, 보안 컨텍스트 아님 | 권한 거부를 성공으로 바꾸지 않는다. |
| `startPreview` | 카메라 선호 조건 | preview session | 카메라 stream 점유 | 장치 없음, 권한 없음, 장치 busy, 미지원 | 제품/세션 상태를 변경하지 않는다. |
| `captureFrame` | preview session, 이미지 옵션 | 업로드 가능한 `File` 포함 `CapturedImage` | 현재 프레임을 이미지 파일로 변환 | stream 종료, 캡처 실패, 이미지 생성 실패 | 캡처 실패 시 빈 파일을 반환하지 않는다. |
| `stopPreview` | preview session | 없음 | 카메라 stream 해제 | 해제 중 오류 | 다른 session을 임의 종료하지 않는다. |

`M86XE` 실기 확인 전에는 해상도, 초점, 노출, 브라우저 종류를 코드 상수로 고정하지 않는다.

## Capture state machine

`CaptureState`는 화면 내부 상태다. `InspectionSession.status`, `InspectionCapture.status`, `ComparisonStatus`와 섞지 않는다.

```ts
export type CaptureState =
  | { name: "loading_step" }
  | { name: "camera_permission_required" }
  | { name: "camera_starting" }
  | { name: "camera_ready" }
  | { name: "capturing" }
  | { name: "captured_unconfirmed"; capturedImage: CapturedImage }
  | { name: "confirming"; capturedImage: CapturedImage }
  | { name: "confirmed_queued"; response: ConfirmInspectionCaptureResponse }
  | { name: "confirmed_processing"; response: ConfirmInspectionCaptureResponse }
  | { name: "camera_failed"; error: ApiError | CameraError }
  | { name: "capture_failed"; error: CameraError }
  | { name: "confirm_failed"; capturedImage: CapturedImage; error: ApiError }
  | { name: "navigating_next" };
```

### 상태 전이

| 현재 상태 | 이벤트 | 다음 상태 | 조건/부작용 |
|---|---|---|---|
| `loading_step` | 단계 조회 성공 | `camera_permission_required` 또는 `camera_starting` | 권한 상태에 따라 분기 |
| `camera_permission_required` | 권한 승인 | `camera_starting` | `startPreview` 호출 |
| `camera_permission_required` | 권한 거부 | `camera_failed` | 촬영 버튼 비활성 |
| `camera_starting` | preview 시작 성공 | `camera_ready` | stream을 preview에 연결 |
| `camera_starting` | preview 시작 실패 | `camera_failed` | 오류 표시 |
| `camera_ready` | 촬영 요청 | `capturing` | 중복 촬영 버튼 잠금 |
| `capturing` | 캡처 성공 | `captured_unconfirmed` | preview용 object URL은 UI 소유로 생성 가능 |
| `capturing` | 캡처 실패 | `capture_failed` | 확정/다음 버튼 비활성 |
| `captured_unconfirmed` | 재촬영 | `camera_ready` | 기존 preview object URL 해제 |
| `captured_unconfirmed` | 확정 요청 | `confirming` | `confirmInspectionCapture` 호출 |
| `confirming` | 확정 성공 + `QUEUED` | `confirmed_queued` | 세션/단계 query 갱신 |
| `confirming` | 확정 성공 + `PROCESSING` | `confirmed_processing` | 세션/단계 query 갱신 |
| `confirming` | 확정 실패 | `confirm_failed` | 촬영 이미지는 유지하고 재시도 허용 |
| `confirm_failed` | 재시도 | `confirming` | 같은 `CapturedImage`로 다시 요청 |
| `confirm_failed` | 재촬영 | `camera_ready` | 기존 이미지 폐기 |
| `confirmed_queued` | 다음 요청 | `navigating_next` | 다음 capture 또는 processing route 이동 |
| `confirmed_processing` | 다음 요청 | `navigating_next` | 다음 capture 또는 processing route 이동 |

### 상태 전이 금지

- `confirmInspectionCapture` 실패 후 `confirmed_*` 상태로 전이하지 않는다.
- `captureFrame` 실패 후 임시 `File`을 만들어 확정하지 않는다.
- `comparisonStatus: "PROCESSED"`를 받더라도 촬영 화면에서 합격/불합격 또는 finding을 표시하지 않는다.
- 최종 결과 route 접근 가능 여부는 로컬 버튼 상태가 아니라 API 세션 상태와 필수 촬영 완료 여부로 판단한다.

## `CaptureStepController` 계약

`CaptureStepController`는 화면 이벤트를 camera/API 호출과 state machine 전이로 연결하는 조정자다. React hook 또는 class로 구현할 수 있지만 계약은 동일해야 한다.

```ts
export interface CaptureStepControllerDeps {
  api: SanilApiClient;
  cameraAdapter: CameraAdapter;
  now: () => IsoDateTimeString;
  createObjectUrl: (file: File) => string;
  revokeObjectUrl: (url: string) => void;
}

export interface LoadCaptureStepInput {
  inspectionSessionUuid: Uuid;
  stepOrder: number;
}

export interface CaptureStepController {
  loadStep(input: LoadCaptureStepInput): Promise<void>;
  requestCameraPermission(): Promise<void>;
  startCamera(): Promise<void>;
  capture(): Promise<void>;
  retake(): Promise<void>;
  confirm(): Promise<void>;
  goNext(): void;
  dispose(): Promise<void>;
}
```

| 함수 | 입력 | 출력 | 부작용 | 실패 | 금지 |
|---|---|---|---|---|---|
| `loadStep` | `inspectionSessionUuid`, `stepOrder` | 없음. 내부 state 갱신 | 세션/단계 API 조회 | 조회 실패 시 오류 state | 없는 단계 데이터를 만들지 않는다. |
| `requestCameraPermission` | 없음 | 없음 | 권한 요청 가능 | 거부/미지원 시 `camera_failed` | 권한 거부 후 자동 재요청 반복 금지 |
| `startCamera` | 없음 | 없음 | camera stream 시작 | 장치 오류 시 `camera_failed` | page/component에서 직접 `getUserMedia` 호출 금지 |
| `capture` | 없음 | 없음 | frame capture, preview 준비 | 캡처 실패 시 `capture_failed` | 실패를 빈 이미지로 대체 금지 |
| `retake` | 없음 | 없음 | 기존 preview 해제, state 초기화 | stream 없음이면 camera 재시작 필요 표시 | 이미 확정된 결과를 성공/실패로 표시 금지 |
| `confirm` | 없음 | 없음 | API 확정 요청, query 갱신 | API 실패 시 `confirm_failed` | 중복 요청, 로컬 성공 처리 금지 |
| `goNext` | 없음 | 없음 | route 이동 | 다음 단계 계산 불가 시 세션 재조회 필요 | 최종 결과 route로 직접 우회 금지 |
| `dispose` | 없음 | 없음 | stream 종료, object URL 해제 | 해제 실패는 로그만 남기되 사용자 성공 상태로 쓰지 않음 | 다른 controller의 camera session 해제 금지 |

의존성은 composition root나 page 조립부에서 주입한다. 전역 mutable singleton이나 service locator로 꺼내 쓰지 않는다.

## 촬영 확정 API 계약

```ts
export interface ConfirmInspectionCaptureRequest {
  inspectionSessionUuid: Uuid;
  referenceUuid: Uuid;
  stepOrder: number;
  imageFile: File;
  capturedAt: IsoDateTimeString;
}

export interface ConfirmInspectionCaptureResponse {
  inspectionSessionUuid: Uuid;
  stepOrder: number;
  inspectedUuid: Uuid;
  inspectedImage: ImageAsset;
  comparisonStatus: "QUEUED" | "PROCESSING";
}
```

### 요청 검증

| 필드 | 검증 기준 |
|---|---|
| `inspectionSessionUuid` | 존재하는 `INSPECTION_SESSION.uuid`여야 하며 현재 사용자 권한 범위 안에 있어야 한다. |
| `referenceUuid` | 해당 제품/세션의 `stepOrder`와 매핑된 기준 사진이어야 한다. |
| `stepOrder` | route param과 request body가 일치해야 한다. |
| `imageFile` | 실제 캡처된 이미지 파일이어야 하며 빈 파일, 지원하지 않는 MIME, 크기 초과는 실패다. |
| `capturedAt` | 프론트 캡처 시각이다. 서버 저장 시각을 대체하지 않는다. |

### 성공 시 부작용

- 백엔드는 이미지 저장소와 `IMAGE` 메타데이터를 생성한다.
- 백엔드는 `INSPECTED`를 생성하거나, 최종 결과 잠금 전 재촬영 확정 정책에 따라 해당 단계의 활성 촬영본을 교체한다.
- 백엔드는 `INSPECTED.inspection_session_uuid`를 `inspectionSessionUuid`에 연결한다.
- 백엔드는 VLM/LLM 비교 처리를 `QUEUED` 또는 `PROCESSING` 상태로 넘긴다.
- 프론트는 `ConfirmInspectionCaptureResponse`의 `comparisonStatus`만 촬영 화면에 표시한다.

재촬영 후 재확정 정책이 백엔드에서 아직 확정되지 않았거나 지원되지 않으면 `conflict` 오류로 드러내야 한다. 프론트는 이를 성공처럼 처리하지 않는다.

### 실패 처리

| 실패 | 화면 기준 |
|---|---|
| `auth` | 로그인 만료 또는 재로그인 필요 상태를 표시한다. |
| `permission` | 해당 세션 촬영 권한이 없음을 표시하고 확정 버튼을 비활성화한다. |
| `validation` | 누락/불일치 필드를 표시하고 같은 이미지로 재시도 가능 여부를 분리한다. |
| `not_found` | 세션 또는 기준 사진이 없어 진행 불가 상태로 표시한다. |
| `conflict` | 이미 완료/잠긴 단계, 재촬영 불가, 세션 상태 충돌을 표시한다. |
| `server` | 서버 오류로 확정 실패를 표시하고 재시도 버튼을 제공한다. |
| `network` | 네트워크 실패로 확정 실패를 표시하고 같은 이미지 재시도를 허용한다. |

실패 시 `capturedSteps`를 로컬 증가시키거나 다음 단계 이동을 허용하지 않는다.

## 개별 판정 비노출 기준

촬영 화면에서 허용되는 처리 정보:

- `NOT_STARTED`
- `QUEUED`
- `PROCESSING`
- `FAILED`
- "저장됨", "처리 대기", "처리 중", "처리 실패" 같은 진행 문구

촬영 화면에서 금지되는 정보:

- `PASSED`, `REJECTED`, `NEEDS_REVIEW`를 합부 의미로 표시
- `FindingJudge`
- `InspectionFinding`
- VLM 관찰/사유/좌표
- 개별 기준 사진별 합격/불합격 배지

`FAILED`는 개별 판정 실패가 아니라 처리 실패 상태로만 표시한다. 최종 결과 화면은 모든 필수 촬영 완료 후 API가 제공하는 최종 결과 계약으로만 표시한다.

## Mock 계약

- mock도 `SanilApiClient`를 구현한다.
- mock fixture는 `src/api/mock/fixtures`에 두며 page/hook/component에 직접 넣지 않는다.
- mock `confirmInspectionCapture`는 `QUEUED` 또는 `PROCESSING`만 반환한다.
- mock은 개별 합부 판정, finding, confidence를 촬영 화면 데이터에 섞지 않는다.
- mock 실패 케이스는 실패를 성공 응답으로 바꾸지 않고 `ApiError`로 표현한다.

## 수동 검증 항목

구현 전후 `M86XE` 실기 또는 고객 제공 사양서로 확인할 항목:

- 후면 카메라가 `preferredFacingMode: "environment"`로 선택되는가
- 권한 거부 후 재시도 UX가 브라우저 정책과 충돌하지 않는가
- portrait/landscape에서 preview, overlay, action bar가 겹치지 않는가
- 촬영 파일 해상도와 업로드 크기가 백엔드 제한과 맞는가
- 네트워크 끊김 후 같은 촬영 이미지를 재확정할 수 있는가
- 전체 촬영 완료 전 개별 판정이 화면에 나타나지 않는가

## 남은 결정 사항

- 재촬영 후 재확정 시 기존 `INSPECTED`를 교체할지 새 row를 만들고 활성본을 지정할지 백엔드 정책 확인이 필요하다.
- `imageFile` 크기 제한, MIME 제한, 압축 품질은 M86XE 실기 캡처 결과와 백엔드 저장소 제한을 함께 보고 확정해야 한다.
- 세션 완료/잠금 상태 enum은 백엔드 구현 시 `INSPECTION_SESSION` 상태 컬럼 또는 `INSPECTED` 집계 정책과 함께 확정해야 한다.
