# Frontend API Contract

## 목적

백엔드가 당장 없어도 프론트는 이 계약 뒤에서만 데이터를 읽는다.

컴포넌트, 화면, hook은 HTTP 또는 mock을 직접 알지 않는다.

DB 기준 테이블은 다음처럼 API에 노출한다.

| DB | API 명칭 |
|---|---|
| `PRODUCT.uuid` | `productUuid` |
| `REFERENCE.uuid` | `referenceUuid` |
| `IMAGE.uuid` | `imageUuid` |
| `INSPECTION_SESSION.uuid` | `inspectionSessionUuid` |
| `INSPECTED.uuid` | `inspectedUuid` |

## 공통 타입

```ts
export type Uuid = string;
export type IsoDateTimeString = string;

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

## Status

DB 상태값은 백엔드 계약이 확정되기 전까지 원본 enum을 유지한다.

```ts
export type InspectionStatus =
  | "PASSED"
  | "PROCESSING"
  | "FAILED"
  | "NEEDS_REVIEW"
  | "REJECTED"
  | "SKIPPED"
  | "DISCARDED";

export type ComparisonStatus =
  | "NOT_STARTED"
  | "QUEUED"
  | "PROCESSING"
  | "PROCESSED"
  | "FAILED";

export type FindingJudge = "OK" | "NG" | "NEEDS_REVIEW";
```

## Auth

```ts
export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface CurrentUser {
  userUuid: Uuid;
  loginId: string;
  name: string;
  authority: "ADMIN" | "USER";
}
```

## Image

```ts
export interface ImageAsset {
  imageUuid: Uuid;
  originalFilename: string;
  mimeType: string;
  width: number;
  height: number;
  imageUrl: string;
  thumbnailUrl: string | null;
}
```

`width`, `height`는 렌더링과 검증용 메타데이터다. guide/result 좌표는 이미지 픽셀이 아니라 `unit: "ratio"`를 기준으로 한다.

## Guide Shape

```ts
export interface RatioPoint {
  x: number;
  y: number;
}

export interface RatioBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ReferenceGuideShape {
  version: number;
  origin: "top_left";
  unit: "ratio";
  source: {
    imageUuid: Uuid | null;
  };
  shapes: ReferenceGuideShapeItem[];
}

export interface ReferenceGuidePolygon {
  shapeType: "polygon";
  label: string | null;
  points: RatioPoint[];
}

export interface ReferenceGuideLine {
  shapeType: "line";
  label: string | null;
  start: RatioPoint;
  end: RatioPoint;
}

export interface ReferenceGuideBox {
  shapeType: "box";
  label: string | null;
  box: RatioBox;
}

export type ReferenceGuideShapeItem =
  | ReferenceGuidePolygon
  | ReferenceGuideLine
  | ReferenceGuideBox;
```

## Product / Reference

```ts
export interface ProductSummary {
  productUuid: Uuid;
  code: string;
  name: string | null;
  remarks: string | null;
  referenceCount: number;
}

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

바코드/QR 촬영 결과는 화면에서 제품으로 임의 매핑하지 않고, 디코딩된 문자열을 `findProductByCode(productCode)`로 조회해 `ProductSummary`를 받는다.

## Inspection Session

검사 세션은 DB `INSPECTION_SESSION.uuid`를 API에서 `inspectionSessionUuid`로 노출한다.

```ts
export interface InspectionSession {
  inspectionSessionUuid: Uuid;
  productUuid: Uuid;
  productCode: string;
  productName: string | null;
  round: number;
  status: InspectionStatus;
  totalSteps: number;
  capturedSteps: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface InspectionCaptureStep {
  inspectionSessionUuid: Uuid;
  stepOrder: number;
  reference: ReferenceShot;
  inspected: InspectionCapture | null;
  comparisonStatus: ComparisonStatus;
}

export interface InspectionCapture {
  inspectedUuid: Uuid;
  inspectionSessionUuid: Uuid;
  referenceUuid: Uuid;
  image: ImageAsset;
  round: number;
  status: InspectionStatus;
}
```

## Capture

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

## Result

```ts
export interface InspectionResultSummary {
  inspectionSessionUuid: Uuid;
  status: InspectionStatus;
  completedAt: IsoDateTimeString | null;
  items: InspectionResultItem[];
}

export interface InspectionResultItem {
  inspectedUuid: Uuid;
  referenceUuid: Uuid;
  referenceImage: ImageAsset | null;
  inspectedImage: ImageAsset;
  status: InspectionStatus;
  findings: InspectionFinding[];
  summary: string | null;
}

export interface InspectionFinding {
  coordinate: RatioBox & {
    origin: "top_left";
    unit: "ratio";
  };
  detail: {
    criteria: string;
    observation: string;
    reason: string;
  };
  judge: FindingJudge;
  confidence: number | null;
}
```

`INSPECTED.result`의 DB 저장 형식이 단일 객체인지 배열인지 아직 완전히 고정되지 않았다. 프론트 API는 화면 표시 안정성을 위해 `findings: InspectionFinding[]`를 받는 형태를 기준으로 한다.

## Inspection History

검사 이력은 세션 목록 표시와 결과 상세 진입에 필요한 최소 필드만 받는다.

```ts
export interface InspectionHistoryItem {
  inspectionSessionUuid: Uuid;
  productCode: string;
  productName: string | null;
  status: InspectionStatus;
  round: number;
  capturedSteps: number;
  totalSteps: number;
  updatedAt: IsoDateTimeString;
}
```

촬영자, 완료 시각, 검색 조건, 페이지네이션은 백엔드 계약이 확정될 때 별도 확장한다. 현재 프론트는 없는 값을 생성하지 않는다.

## API 함수

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
  listInspectionHistory(): Promise<InspectionHistoryItem[]>;
}

export interface CreateReferenceShotRequest {
  productUuid: Uuid;
  name: string;
  stepOrder: number;
  remarks: string | null;
  imageFile: File;
}

export interface UpdateReferenceGuideShapeRequest {
  referenceUuid: Uuid;
  guideShape: ReferenceGuideShape;
}
```

## 금지

- API 실패를 빈 배열이나 성공 상태로 바꾸지 않는다.
- `referenceCount`, `totalSteps`, `capturedSteps` 같은 값을 컴포넌트에서 API 값처럼 임의 생성하지 않는다.
- mock adapter는 같은 interface를 구현해야 하며 화면 편의용 데이터를 만들지 않는다.
- 백엔드가 제공하지 않은 비즈니스 값은 프론트에서 보정하지 않는다.
