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

export type InspectionStatus =
  | "PASSED"
  | "PROCESSING"
  | "FAILED"
  | "NEEDS_REVIEW"
  | "REJECTED"
  | "SKIPPED"
  | "DISCARDED";

export type ComparisonStatus = "NOT_STARTED" | "QUEUED" | "PROCESSING" | "PROCESSED" | "FAILED";
export type FindingJudge = "OK" | "NG" | "NEEDS_REVIEW";

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

export interface ImageAsset {
  imageUuid: Uuid;
  originalFilename: string;
  mimeType: string;
  width: number;
  height: number;
  imageUrl: string;
  thumbnailUrl: string | null;
}

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
  source: { imageUuid: Uuid | null };
  shapes: ReferenceGuideShapeItem[];
}

export type ReferenceGuideShapeItem =
  | { shapeType: "polygon"; label: string | null; points: RatioPoint[] }
  | { shapeType: "line"; label: string | null; start: RatioPoint; end: RatioPoint }
  | { shapeType: "box"; label: string | null; box: RatioBox };

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

export interface InspectionCapture {
  inspectedUuid: Uuid;
  inspectionSessionUuid: Uuid;
  referenceUuid: Uuid;
  image: ImageAsset;
  round: number;
  status: InspectionStatus;
}

export interface InspectionCaptureStep {
  inspectionSessionUuid: Uuid;
  stepOrder: number;
  reference: ReferenceShot;
  inspected: InspectionCapture | null;
  comparisonStatus: ComparisonStatus;
}

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

export interface InspectionFinding {
  coordinate: RatioBox & { origin: "top_left"; unit: "ratio" };
  detail: {
    criteria: string;
    observation: string;
    reason: string;
  };
  judge: FindingJudge;
  confidence: number | null;
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

export interface InspectionResultSummary {
  inspectionSessionUuid: Uuid;
  status: InspectionStatus;
  completedAt: IsoDateTimeString | null;
  items: InspectionResultItem[];
}

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

export interface SanilApiClient {
  login(request: LoginRequest): Promise<CurrentUser>;
  getCurrentUser(): Promise<CurrentUser>;
  listProducts(): Promise<ProductSummary[]>;
  listReferenceShots(productUuid: Uuid): Promise<ReferenceShot[]>;
  createReferenceShot(request: CreateReferenceShotRequest): Promise<ReferenceShot>;
  updateReferenceGuideShape(request: UpdateReferenceGuideShapeRequest): Promise<ReferenceShot>;
  createInspectionSession(productUuid: Uuid): Promise<InspectionSession>;
  getInspectionSession(inspectionSessionUuid: Uuid): Promise<InspectionSession>;
  getInspectionCaptureStep(inspectionSessionUuid: Uuid, stepOrder: number): Promise<InspectionCaptureStep>;
  confirmInspectionCapture(request: ConfirmInspectionCaptureRequest): Promise<ConfirmInspectionCaptureResponse>;
  getInspectionResult(inspectionSessionUuid: Uuid): Promise<InspectionResultSummary>;
  listInspectionHistory(): Promise<InspectionHistoryItem[]>;
}
