# Reference and Guide Detail

## 문서 목적

제품별 기준 사진 등록, 목록, 순서 관리와 guide shape 표시/편집의 상세 설계를 정의한다.

이 문서는 구현 코드가 아니라 이후 `admin`, `references`, `reference-guide`, `inspection-capture` 구현자가 따를 계약 문서다.

## 참조 기준

- `frontend/docs/frontend-design.md`
- `frontend/docs/api-contract.md`
- `frontend/docs/photo-qa-ui.md`
- `frontend/docs/capture-screen-design.md`
- `docs/project/device-constraints.md`
- `backend/docs/database/tables/REFERENCE.md`
- `mulAg/common-rules.md`
- `mulAg/sub-agent.md`

## 범위

| 구분 | 포함 | 제외 |
|---|---|---|
| 기준 사진 | 작업자용 제품별 목록, 관리자 등록, 순서 표시와 변경 요청 설계 | QA 대상 촬영 이미지 생성 |
| guide shape | 저장 계약, 표시, 편집 draft, 검증, 저장 요청 설계 | VLM 결과 생성, 판정 보정 |
| 좌표 | `origin: "top_left"`, `unit: "ratio"` 검증과 렌더링 변환 | 픽셀 좌표 저장 |
| overlay | 기준 이미지와 카메라 preview 위 렌더링 계약 | 실제 카메라 제어 |

## 책임 경계

| 영역 | 책임 | 금지 경계 |
|---|---|---|
| `admin` | 기준 사진 등록, 순서 표시, 순서 변경 요청, guide 편집 진입 | QA 대상 촬영 결과 생성 |
| `references` | 작업자용 기준 사진 목록 조회와 guide 등록 상태 표시 | 기준 사진 등록/수정 |
| `reference-guide` | `ReferenceGuideShape` 표시, 편집 draft 관리, ratio 검증, guide 저장 요청 | 기준 사진 파일 업로드, VLM 판정 결과 생성 |
| `inspection-capture` | 저장된 기준 사진과 guide shape를 촬영 preview overlay로 소비 | guide shape 저장/수정, 기준 사진 순서 변경 |
| `src/api` | HTTP/mock adapter 뒤에서 API 계약 제공 | 화면/훅/컴포넌트에 HTTP 또는 mock 직접 노출 |

기준 사진과 QA 대상 촬영 결과는 같은 제품과 step 흐름을 공유하지만 소유 데이터가 다르다. 기준 사진 등록은 `REFERENCE`와 연결된 `IMAGE`를 만들거나 참조하는 작업이고, QA 대상 촬영 확정은 `INSPECTED`와 검사 세션에 속한다.

## 데이터 계약

### ReferenceShot

`ReferenceShot`은 기준 사진 한 개와 촬영 단계 정보를 나타낸다.

```ts
export interface ReferenceShot {
  referenceUuid: Uuid;
  productUuid: Uuid;
  image: ImageAsset | null;
  name: string;
  stepOrder: number;
  remarks: string | null;
  guideShape: ReferenceGuideShape | null;
}
```

계약:

- `referenceUuid`는 기준 사진 레코드의 안정 식별자다.
- `productUuid`는 목록 route의 `productUuid`와 같아야 한다.
- `image`가 `null`이면 기준 레코드는 남아 있지만 기준 이미지 파일이 없거나 삭제된 상태다.
- `stepOrder`는 촬영 유도 순서다. 화면은 오름차순으로 표시하되 중복이나 누락을 임의 보정하지 않는다.
- `remarks`는 촬영 지시 또는 중점 확인 사항으로 표시할 수 있다.
- `guideShape`가 `null`이면 guide shape 미등록 상태다.

금지:

- 화면에서 `referenceCount`, `stepOrder`, `guideShape`를 API 값처럼 임의 생성하지 않는다.
- `image === null`인 항목을 성공 항목처럼 숨기지 않는다.
- 기준 사진 등록 결과를 검사 세션 또는 촬영 완료로 취급하지 않는다.

### ReferenceGuideShape

저장되는 guide shape는 API 계약의 `ReferenceGuideShape`만 사용한다.

```ts
export interface ReferenceGuideShape {
  version: number;
  origin: "top_left";
  unit: "ratio";
  source: {
    imageUuid: Uuid | null;
  };
  shapes: ReferenceGuideShapeItem[];
}
```

필수 불변 조건:

- `origin`은 항상 `"top_left"`다.
- `unit`은 항상 `"ratio"`다.
- 저장 좌표는 원본 이미지 픽셀이 아니라 0 이상 1 이하의 비율이다.
- `source.imageUuid`는 guide shape가 작성된 기준 이미지의 `imageUuid`를 가리킨다.
- 기준 이미지가 교체되거나 `source.imageUuid`가 현재 `ReferenceShot.image.imageUuid`와 다르면 stale guide로 다룬다.
- 렌더링에서만 픽셀 좌표로 변환한다.

현재 읽기 전용 DB 문서 `backend/docs/database/tables/REFERENCE.md`에는 `guide_shape` 필드가 보이지 않는다. 본 문서는 todo 선행 조건과 API 계약의 `ReferenceGuideShape`를 기준으로 설계하되, DB 문서 갱신 필요성은 review에 남긴다.

## Route와 화면 흐름

| Route | Feature | 목적 |
|---|---|---|
| `/products/:productUuid/references` | `references` | 작업자용 기준 사진 목록과 guide 등록 상태 확인 |
| `/admin/references` | `admin` | 관리자 기준 사진 등록/관리 |
| `/inspections/:inspectionSessionUuid/capture/:stepOrder` | `inspection-capture` | 저장된 guide shape를 촬영 overlay로 소비 |

guide shape 편집 화면은 후속 구현 대상이다. 현재 화면은 guide 등록 상태와 overlay 표시만 책임진다.

## API 작업 계약

### 확정된 기존 계약

| API 함수 | 입력 | 출력 | 실패 처리 |
|---|---|---|---|
| `listReferenceShots(productUuid)` | 제품 UUID | `ReferenceShot[]` | 실패를 빈 배열로 바꾸지 않고 오류 상태를 표시 |
| `createReferenceShot(request)` | 제품 UUID, 이름, 순서, 설명, 이미지 파일 | 생성된 `ReferenceShot` | 업로드/검증 실패 시 등록 완료로 표시하지 않음 |
| `updateReferenceGuideShape(request)` | 기준 사진 UUID, `ReferenceGuideShape` | 갱신된 `ReferenceShot` | guide 저장 실패 시 draft 유지, 저장 완료로 표시하지 않음 |

`createReferenceShot`과 `updateReferenceGuideShape`는 관리자 화면에서만 호출한다. 작업자용 기준 사진 목록 화면은 `listReferenceShots`만 호출한다.

### 후속 API 계약이 필요한 작업

기준 사진 순서 변경과 기준 사진 메타데이터 수정은 현재 `api-contract.md`에 함수가 없다. 구현 전에 API 계약 문서 갱신이 필요하다.

```ts
export interface UpdateReferenceShotRequest {
  referenceUuid: Uuid;
  name: string;
  stepOrder: number;
  remarks: string | null;
}

export interface ReorderReferenceShotsRequest {
  productUuid: Uuid;
  orderedReferences: Array<{
    referenceUuid: Uuid;
    stepOrder: number;
  }>;
}
```

금지:

- 순서 변경 API가 없는데 화면에서 로컬 순서만 저장된 것처럼 표시하지 않는다.
- 중복 `stepOrder`를 프론트에서 조용히 재번호화하지 않는다.
- mock adapter가 화면 편의를 위해 백엔드에 없는 성공 상태를 만들지 않는다.

## 기준 사진 등록 상세

기준 사진 등록은 `/admin/references` 관리자 화면의 책임이다. 제품 선택, 등록 폼, 등록 후 목록 갱신은 같은 관리자 화면 안에서 처리한다.

### 입력

| 입력 | 출처 | 검증 |
|---|---|---|
| `productUuid` | route param | 비어 있으면 등록 화면 진입 실패 |
| `name` | 사용자 입력 | 공백만 있는 값 금지, 최대 길이는 API 또는 백엔드 계약 기준 |
| `stepOrder` | 사용자 입력 또는 API가 제공한 명시값 | 숫자, 1 이상, 같은 제품 내 중복 여부는 API 검증 결과를 우선 |
| `remarks` | 사용자 입력 | `null` 또는 문자열 |
| `imageFile` | 파일 선택/카메라 캡처 | 이미지 MIME, 파일 존재 여부, 브라우저가 읽을 수 있는지 확인 |

### 출력

- 성공 시 `createReferenceShot`이 반환한 `ReferenceShot`을 기준으로 목록 캐시를 갱신한다.
- 실패 시 `ApiError`와 필드 검증 오류를 분리해서 표시한다.
- 생성 직후 guide shape는 `null`일 수 있으며, 화면은 guide 편집 진입을 별도 액션으로 제공한다.

### 부작용

- API 요청을 통해 기준 사진과 이미지 저장을 요청한다.
- 성공 후 route 이동 또는 목록 갱신이 발생할 수 있다.
- 검사 세션이나 QA 대상 촬영 결과는 만들지 않는다.

### 실패

- 이미지 업로드 실패: 기준 사진 생성 완료로 표시하지 않는다.
- 권한 실패: `permission` 오류로 표시하고 재시도 버튼과 구분한다.
- 네트워크 실패: 입력 draft를 보존한다.
- 서버 validation 실패: API가 준 필드 오류 또는 메시지를 표시한다.

## 기준 사진 목록과 순서 상세

### 목록 표시

- `listReferenceShots(productUuid)` 결과를 `stepOrder` 오름차순으로 표시한다.
- 같은 `stepOrder`가 있으면 목록은 표시하되 충돌 상태를 노출한다.
- `image === null`이면 썸네일 자리에는 이미지 없음 상태를 표시한다.
- `guideShape === null`이면 guide 미등록 상태를 표시한다.
- stale guide는 `source.imageUuid`와 현재 이미지 UUID 불일치로 판단한다.

### 순서 변경

순서 변경은 저장 가능한 API 계약이 있을 때만 활성화한다.

흐름:

1. 사용자가 목록에서 순서를 변경한다.
2. 화면은 변경 draft를 만든다.
3. 저장 전 중복, 누락, 1 미만 값, 숫자 아님을 검증한다.
4. `reorderReferenceShots` 같은 명시 API로 전체 순서를 저장한다.
5. 성공 응답의 `ReferenceShot[]` 또는 재조회 결과로 화면을 갱신한다.

금지:

- drag/drop만으로 서버 저장이 끝난 것처럼 표시하지 않는다.
- 실패 시 이전 서버 상태를 덮어쓰지 않는다.
- stepOrder를 화면 표시용 index로 대체하지 않는다.

## Guide Shape 표시/편집 상세

### 표시 모드

표시 모드는 세 가지다.

| 모드 | 위치 | 동작 |
|---|---|---|
| `reference_view` | 기준 사진 목록/상세 | 읽기 전용 preview |
| `guide_edit` | guide 편집 화면 | draft shape 표시와 편집 |
| `capture_overlay` | QA 대상 촬영 화면 | 저장된 guide shape를 카메라 preview 위에 표시 |

모든 모드는 같은 저장 좌표를 사용하지만, 렌더링 대상 rect는 다르다. `reference_view`와 `guide_edit`는 기준 이미지의 실제 표시 영역에 맞추고, `capture_overlay`는 카메라 preview의 overlay frame에 맞춘다.

### 편집 상태

| 상태 | 의미 | 허용 액션 |
|---|---|---|
| `empty` | guide shape 없음 | 새 shape 추가 |
| `viewing` | 유효한 shape 읽기 | 편집 시작 |
| `editing` | 저장 전 draft 있음 | 점/선/박스 수정, 취소, 저장 |
| `invalid` | draft 또는 저장 shape가 검증 실패 | 오류 확인, 수정 |
| `saving` | 저장 요청 중 | 중복 저장 금지 |
| `save_failed` | 저장 실패 | 재시도, draft 유지 |

편집 중 shape 좌표는 ratio draft로 보관한다. 포인터 위치는 이벤트 처리 중에만 픽셀에서 ratio로 변환한다.

### Shape 유형

| 유형 | 계약 | 검증 |
|---|---|---|
| `box` | `box: { x, y, w, h }` | `x`, `y`, `w`, `h` finite number, `w > 0`, `h > 0`, `x + w <= 1`, `y + h <= 1` |
| `line` | `start`, `end` | 두 점 모두 유효, 시작점과 끝점이 같지 않음 |
| `polygon` | `points[]` | 최소 3점, 모든 점 유효, 면적 0 금지 |

`label`은 `null` 또는 문자열이다. label은 화면 설명일 뿐 판정 로직으로 쓰지 않는다.

## Ratio 좌표 검증 계약

### 공통 규칙

- 모든 숫자는 `Number.isFinite(value)`를 통과해야 한다.
- ratio 좌표는 `0 <= value <= 1`이다.
- box의 오른쪽과 아래쪽 경계는 `x + w <= 1`, `y + h <= 1`이어야 한다.
- 렌더링 편의를 위해 값을 clamp하지 않는다.
- 부동소수점 오차 허용 범위가 필요하면 검증 함수 내부 상수로만 사용하고 저장값을 수정하지 않는다.
- 실패는 validation issue로 반환하고 성공으로 숨기지 않는다.

### Validation result

```ts
export type GuideShapeValidationSeverity = "error" | "warning";

export interface GuideShapeValidationIssue {
  path: string;
  code:
    | "missing_shape"
    | "unsupported_version"
    | "invalid_origin"
    | "invalid_unit"
    | "source_image_mismatch"
    | "empty_shapes"
    | "invalid_shape_type"
    | "invalid_ratio_point"
    | "invalid_ratio_box"
    | "degenerate_shape";
  severity: GuideShapeValidationSeverity;
  message: string;
}

export interface GuideShapeValidationResult {
  ok: boolean;
  issues: GuideShapeValidationIssue[];
}
```

검증 결과는 원본 shape를 변경하지 않는다. 자동 보정이 필요한 경우에도 별도 편집 액션으로 사용자에게 드러내야 한다.

## Overlay 렌더링 상세

### 렌더링 입력

렌더링은 저장 shape와 화면상 이미지 rect를 분리해서 받는다.

```ts
export interface RenderedImageRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ViewportPoint {
  x: number;
  y: number;
}
```

`RenderedImageRect`는 이미지 또는 preview가 실제로 그려진 content box다. CSS `object-fit: contain`을 쓰는 경우에는 컨테이너 전체가 아니라 letterbox를 제외한 실제 표시 영역을 사용한다.

### 변환 공식

```text
viewportX = rect.left + ratioX * rect.width
viewportY = rect.top + ratioY * rect.height
```

`origin: "top_left"` 기준이므로 y축은 위에서 아래로 증가한다.

### 렌더링 원칙

- 저장 shape는 변경하지 않는다.
- 렌더링 시점에만 viewport pixel 좌표로 변환한다.
- SVG, canvas, DOM 중 무엇을 쓰든 외부 계약은 `ReferenceGuideShape`와 `RenderedImageRect`다.
- 현장 조명에서 보이도록 선 두께, 색상, 투명도는 UI 옵션으로 조절 가능해야 한다.
- M86XE portrait/landscape 전환 시 rect를 다시 계산한다.
- 카메라 preview 비율과 기준 이미지 비율이 다르면 overlay는 visual guide이며 치수 판정 근거가 아니다.

## 함수/컴포넌트 계약

### `ReferenceShotList`

역할: 제품별 기준 사진 목록과 순서 상태를 표시한다.

입력:

```ts
export interface ReferenceShotListProps {
  productUuid: Uuid;
  references: ReferenceShot[];
  isLoading: boolean;
  error: ApiError | null;
  onOpenCreate: () => void;
  onOpenGuide: (referenceUuid: Uuid) => void;
  onRequestReorder?: (request: ReorderReferenceShotsRequest) => Promise<ReferenceShot[]>;
}
```

출력:

- 기준 사진 목록 UI
- guide 등록/미등록/stale 상태
- 순서 변경 draft와 저장 요청 이벤트

부작용:

- 직접 API를 호출하지 않는다.
- 전달받은 callback만 호출한다.

실패:

- `error`가 있으면 빈 목록으로 위장하지 않고 오류 상태를 표시한다.
- 순서 저장 실패 시 draft와 서버 상태를 구분해서 표시한다.

금지:

- `stepOrder`를 컴포넌트 index로 임의 대체하지 않는다.
- `guideShape`를 생성하지 않는다.
- mock 데이터를 import하지 않는다.

### `ReferenceShotCreateForm`

역할: 기준 사진 등록 입력과 제출 이벤트를 관리한다.

입력:

```ts
export interface ReferenceShotCreateFormProps {
  productUuid: Uuid;
  isSubmitting: boolean;
  submitError: ApiError | null;
  onSubmit: (request: CreateReferenceShotRequest) => Promise<ReferenceShot>;
  onCancel: () => void;
}
```

출력:

- `CreateReferenceShotRequest`
- 필드 validation error
- 등록 성공 후 반환된 `ReferenceShot`

부작용:

- 이미지 preview를 위해 브라우저 object URL을 만들 수 있다.
- object URL은 화면 이탈 시 해제해야 한다.
- API 호출은 container 또는 hook이 주입한 `onSubmit`을 통해서만 수행한다.

실패:

- 파일 읽기 실패, validation 실패, API 실패를 분리한다.
- API 실패 시 입력값과 선택 파일 상태를 가능한 보존한다.

금지:

- 등록 성공 전에 목록에 저장된 것처럼 optimistic 확정 표시를 하지 않는다.
- 검사 세션을 생성하지 않는다.
- guide shape를 자동 생성하지 않는다.

### `ReferenceGuideCanvas`

역할: `ReferenceGuideShape`를 기준 이미지 또는 preview rect 위에 overlay로 표시한다.

입력:

```ts
export interface ReferenceGuideCanvasProps {
  guideShape: ReferenceGuideShape | null;
  renderedRect: RenderedImageRect;
  mode: "reference_view" | "guide_edit" | "capture_overlay";
  selectedShapeIndex?: number | null;
  showLabels: boolean;
  overlayOpacity: number;
  validation: GuideShapeValidationResult;
}
```

출력:

- shape별 overlay primitive
- 선택 shape 강조 표시
- validation warning/error 표시

부작용:

- DOM 또는 canvas 렌더링만 수행한다.
- 저장 API를 호출하지 않는다.
- 입력 shape를 mutate하지 않는다.

실패:

- `guideShape === null`이면 빈 overlay 상태를 표시한다.
- validation `ok === false`이면 오류 overlay 또는 편집 차단 상태를 표시한다.
- `renderedRect.width <= 0` 또는 `height <= 0`이면 렌더링을 보류한다.

금지:

- ratio 값을 clamp해서 그리지 않는다.
- pixel 좌표를 저장하거나 상위로 저장값처럼 emit하지 않는다.
- VLM finding과 guide shape를 같은 데이터로 합치지 않는다.

### `GuideShapeEditor`

역할: 기준 이미지 위에서 guide shape draft를 편집하고 저장 요청 가능한 shape를 만든다.

입력:

```ts
export interface GuideShapeEditorProps {
  reference: ReferenceShot;
  initialGuideShape: ReferenceGuideShape | null;
  renderedRect: RenderedImageRect;
  onSave: (guideShape: ReferenceGuideShape) => Promise<ReferenceShot>;
  onCancel: () => void;
}
```

출력:

- 편집 draft `ReferenceGuideShape`
- validation result
- 저장 요청 shape

부작용:

- 포인터 이벤트를 ratio draft로 변환한다.
- 저장 버튼 클릭 시 `onSave` callback을 호출한다.
- 저장 성공 후 API가 반환한 `ReferenceShot`을 상위가 반영한다.

실패:

- 기준 이미지가 없으면 편집을 시작하지 않는다.
- `source.imageUuid` 불일치가 있으면 stale 상태를 표시하고 명시적 재작성 또는 초기화가 필요하다.
- 저장 실패 시 draft를 유지한다.

금지:

- 현재 이미지와 다른 `source.imageUuid`를 조용히 현재 이미지로 바꾸지 않는다.
- 저장 전 validation error를 무시하지 않는다.
- 화면 편의를 위해 label이나 shape를 판정 기준으로 확정하지 않는다.

### `validateGuideShape`

역할: guide shape 저장 전과 렌더링 전 ratio 계약 위반을 찾는다.

입력:

```ts
export interface ValidateGuideShapeInput {
  guideShape: ReferenceGuideShape | null;
  currentImageUuid: Uuid | null;
  allowEmptyShapes: boolean;
}

export function validateGuideShape(
  input: ValidateGuideShapeInput,
): GuideShapeValidationResult;
```

출력:

- `ok: true`이면 저장 또는 렌더링 가능한 shape다.
- `ok: false`이면 하나 이상의 error issue가 있다.
- warning은 표시하되 저장 차단 여부는 화면 정책으로 결정한다.

부작용:

- 없음.

실패:

- 예외를 던지지 않고 validation issue로 반환한다.
- 입력 타입 자체가 런타임에서 계약과 다르면 `invalid_shape_type` 또는 해당 issue로 반환한다.

금지:

- 입력 객체를 수정하지 않는다.
- ratio 값을 반올림, clamp, 정렬하지 않는다.
- `origin` 또는 `unit`을 자동 보정하지 않는다.

### `ratioToViewportPoint`

역할: ratio 좌표를 현재 렌더링 rect 기준 viewport pixel 좌표로 변환한다.

입력:

```ts
export function ratioToViewportPoint(
  point: RatioPoint,
  rect: RenderedImageRect,
): ViewportPoint;
```

출력:

- `{ x, y }` viewport 좌표

부작용:

- 없음.

실패:

- point 또는 rect 값이 finite number가 아니면 validation 단계에서 차단되어야 한다.
- 이 함수가 직접 validation을 수행해야 한다면 `RangeError`가 아니라 명시 result wrapper를 쓰는 별도 safe 함수로 분리한다.

금지:

- ratio point를 mutate하지 않는다.
- `IMAGE.width`, `IMAGE.height`를 저장 좌표 기준으로 사용하지 않는다.
- y축을 bottom-left 기준으로 뒤집지 않는다.

### `viewportPointToRatio`

역할: 편집 중 포인터 좌표를 ratio 좌표로 변환한다.

입력:

```ts
export function viewportPointToRatio(
  point: ViewportPoint,
  rect: RenderedImageRect,
): RatioPoint;
```

출력:

- `{ x, y }` ratio 좌표

부작용:

- 없음.

실패:

- rect 크기가 0이면 변환할 수 없으므로 편집 이벤트를 무시하고 오류 상태를 남긴다.
- rect 밖 포인터는 draft 반영 전에 validation으로 차단한다.

금지:

- rect 밖 값을 자동으로 0 또는 1로 clamp하지 않는다.
- 저장 shape에 pixel 좌표를 섞지 않는다.

### `buildGuideOverlayPrimitives`

역할: guide shape를 렌더링 엔진이 소비할 viewport primitive로 변환한다.

입력:

```ts
export type GuideOverlayPrimitive =
  | { kind: "line"; label: string | null; start: ViewportPoint; end: ViewportPoint }
  | { kind: "box"; label: string | null; x: number; y: number; width: number; height: number }
  | { kind: "polygon"; label: string | null; points: ViewportPoint[] };

export function buildGuideOverlayPrimitives(
  guideShape: ReferenceGuideShape,
  rect: RenderedImageRect,
): GuideOverlayPrimitive[];
```

출력:

- viewport 좌표 primitive 배열

부작용:

- 없음.

실패:

- 호출 전 `validateGuideShape`를 통과해야 한다.
- 통과하지 않은 shape가 들어오면 렌더링하지 않고 상위 validation 오류를 표시한다.

금지:

- primitive를 저장 데이터로 사용하지 않는다.
- label을 판정 로직으로 사용하지 않는다.

## 이벤트 흐름

### 기준 사진 등록

1. 사용자가 제품 기준 사진 목록에서 등록을 선택한다.
2. 등록 화면은 `productUuid`를 route에서 읽는다.
3. 사용자가 이름, 순서, 설명, 이미지 파일을 입력한다.
4. 화면 validation을 통과하면 `createReferenceShot`을 호출한다.
5. 성공 응답의 `ReferenceShot`으로 목록을 갱신하거나 guide 편집 진입을 제공한다.
6. 실패하면 오류를 표시하고 입력 draft를 유지한다.

### 기준 사진 순서 변경

1. 사용자가 목록 순서를 편집한다.
2. 화면은 서버 상태와 별도의 reorder draft를 만든다.
3. 저장 전에 중복 순서와 잘못된 숫자를 검증한다.
4. 순서 저장 API가 있으면 전체 순서 요청을 보낸다.
5. 성공 응답 또는 재조회 결과로 표시 순서를 확정한다.
6. 실패하면 서버 상태와 draft 차이를 표시한다.

### Guide shape 편집

1. 사용자가 기준 사진 목록에서 guide 편집을 연다.
2. 화면은 기준 사진 이미지와 현재 guide shape를 표시한다.
3. `validateGuideShape`가 저장 shape를 검증한다.
4. 사용자가 shape를 추가하거나 포인터로 점을 이동한다.
5. `viewportPointToRatio`로 draft ratio 좌표를 계산한다.
6. 저장 전에 `origin`, `unit`, point, box, source를 다시 검증한다.
7. `updateReferenceGuideShape`를 호출한다.
8. 성공 응답으로 화면 상태를 갱신하고, 실패 시 draft를 유지한다.

### Capture overlay 렌더링

1. 촬영 단계 화면이 `InspectionCaptureStep.reference`를 받는다.
2. 기준 사진과 guide shape를 읽기 전용으로 소비한다.
3. 카메라 preview의 실제 content rect를 계산한다.
4. `validateGuideShape`를 통과한 shape만 overlay primitive로 변환한다.
5. 사용자는 overlay를 참고해 촬영하되, overlay가 검사 결과를 직접 확정하지 않는다.

## 문제점과 처리 방향

| 문제 | 영향 | 처리 방향 |
|---|---|---|
| DB 문서에 `guide_shape` 필드가 보이지 않음 | 백엔드 저장 계약 확인 필요 | DB/API 계약 갱신 todo 필요 |
| 순서 변경 API 미정 | 목록 reorder 구현 불가 | `ReorderReferenceShotsRequest`를 API 계약에 추가해야 함 |
| 장비 실제 viewport 미확정 | overlay 가시성, 버튼 크기 검증 필요 | M86XE 실기 PoC 후 CSS/rect 계산 기준 확정 |
| 카메라 preview와 기준 이미지 비율 불일치 | overlay가 치수 판정처럼 오해될 수 있음 | visual guide임을 화면 책임과 문서에 유지 |

## 검증 체크리스트

- guide shape 저장값에 pixel 좌표가 포함되지 않는다.
- 모든 저장 shape는 `origin: "top_left"`, `unit: "ratio"`를 가진다.
- 렌더링 좌표 변환은 저장 shape를 변경하지 않는다.
- 기준 사진 등록은 검사 세션이나 QA 대상 촬영 결과를 만들지 않는다.
- API 실패를 빈 목록, 빈 shape, 성공 상태로 숨기지 않는다.
- 목록 순서 충돌을 프론트에서 조용히 재번호화하지 않는다.
- M86XE portrait/landscape 전환 시 overlay rect를 다시 계산한다.
- VLM 결과 finding과 기준 guide shape를 같은 타입으로 섞지 않는다.
