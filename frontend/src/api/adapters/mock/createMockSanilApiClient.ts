import { SanilApiError } from "../../errors";
import type {
  ConfirmInspectionCaptureRequest,
  ConfirmInspectionCaptureResponse,
  CurrentUser,
  ImageAsset,
  InspectionCapture,
  InspectionCaptureStep,
  InspectionHistoryItem,
  InspectionResultItem,
  InspectionResultSummary,
  InspectionSession,
  ProductSummary,
  ReferenceShot,
  SanilApiClient,
} from "../../contracts";
import type { sanilMockFixtures } from "../../mock/fixtures/sanilFixtures";
import { createMockImageAsset } from "./createMockImageAsset";

export interface CreateMockSanilApiClientOptions {
  fixtures: typeof sanilMockFixtures;
}

interface SessionRecord {
  session: InspectionSession;
  captures: Map<string, InspectionCapture>;
}

export function createMockSanilApiClient(options: CreateMockSanilApiClientOptions): SanilApiClient {
  const { fixtures } = options;
  let currentUser: CurrentUser | null = null;
  const products = fixtures.products.map((product) => ({ ...product }));
  const references = fixtures.references.map((reference) => ({ ...reference }));
  const sessions = new Map<string, SessionRecord>();

  const now = () => new Date().toISOString();
  const delay = <T>(value: T) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value), 180));

  const requireUser = () => {
    if (!currentUser) {
      throw new SanilApiError("auth", "로그인이 필요합니다.");
    }
    return currentUser;
  };

  const referencesFor = (productUuid: string) =>
    references.filter((reference) => reference.productUuid === productUuid).sort((a, b) => a.stepOrder - b.stepOrder);

  const getRecord = (inspectionSessionUuid: string) => {
    const record = sessions.get(inspectionSessionUuid);
    if (!record) {
      throw new SanilApiError("not_found", "검사 세션을 찾을 수 없습니다.");
    }
    return record;
  };

  const getHistoricalResult = (inspectionSessionUuid: string): InspectionResultSummary | null => {
    if (inspectionSessionUuid !== "session-history-001") {
      return null;
    }
    const references = referencesFor("product-transformer-a");
    return {
      inspectionSessionUuid,
      status: "NEEDS_REVIEW",
      completedAt: fixtures.history[0]?.updatedAt ?? now(),
      items: references.map((reference) => ({
        inspectedUuid: `history-${reference.referenceUuid}`,
        referenceUuid: reference.referenceUuid,
        referenceImage: reference.image,
        inspectedImage: makeInspectionImage(reference.referenceUuid),
        status: reference.referenceUuid === "reference-transformer-marker" ? "NEEDS_REVIEW" : "PASSED",
        findings: fixtures.findings[reference.referenceUuid] ?? [],
        summary:
          reference.referenceUuid === "reference-transformer-marker"
            ? "체결 마커 정렬 검토가 필요합니다."
            : "기준 사진 대비 주요 차이가 없습니다.",
      })),
    };
  };

  const refreshSession = (record: SessionRecord) => {
    const refs = referencesFor(record.session.productUuid);
    record.session.capturedSteps = record.captures.size;
    record.session.status = record.captures.size >= refs.length ? "PROCESSING" : "PROCESSING";
    record.session.updatedAt = now();
  };

  const makeInspectionImage = (referenceUuid: string): ImageAsset => {
    if (referenceUuid === "reference-transformer-marker") {
      return fixtures.inspectionImages.markerNg;
    }
    if (referenceUuid === "reference-transformer-label") {
      return fixtures.inspectionImages.labelOk;
    }
    return fixtures.inspectionImages.ok;
  };

  return {
    async login() {
      currentUser = fixtures.user;
      return delay(currentUser);
    },
    async getCurrentUser() {
      return delay(requireUser());
    },
    async listProducts() {
      requireUser();
      return delay<ProductSummary[]>(products);
    },
    async listReferenceShots(productUuid) {
      requireUser();
      if (!products.some((product) => product.productUuid === productUuid)) {
        throw new SanilApiError("not_found", "제품을 찾을 수 없습니다.");
      }

      const references = referencesFor(productUuid);
      return delay<ReferenceShot[]>(references);
    },
    async createReferenceShot(request) {
      requireUser();
      const product = products.find((item) => item.productUuid === request.productUuid);
      if (!product) {
        throw new SanilApiError("not_found", "제품을 찾을 수 없습니다.");
      }

      const name = request.name.trim();
      if (!name) {
        throw new SanilApiError("validation", "기준 사진명을 입력해야 합니다.");
      }

      if (!Number.isInteger(request.stepOrder) || request.stepOrder < 1) {
        throw new SanilApiError("validation", "촬영 순서는 1 이상의 정수여야 합니다.");
      }

      if (referencesFor(request.productUuid).some((reference) => reference.stepOrder === request.stepOrder)) {
        throw new SanilApiError("conflict", "이미 사용 중인 촬영 순서입니다.");
      }

      const timestamp = Date.now().toString(36);
      const reference: ReferenceShot = {
        referenceUuid: `reference-upload-${timestamp}`,
        productUuid: request.productUuid,
        image: await createMockImageAsset(request.imageFile, "image-reference-upload"),
        name,
        stepOrder: request.stepOrder,
        remarks: request.remarks?.trim() ? request.remarks.trim() : null,
        guideShape: null,
      };
      references.push(reference);
      product.referenceCount = referencesFor(product.productUuid).length;
      return delay(reference);
    },
    async updateReferenceGuideShape(request) {
      requireUser();
      const index = references.findIndex((reference) => reference.referenceUuid === request.referenceUuid);
      if (index < 0) {
        throw new SanilApiError("not_found", "기준 사진을 찾을 수 없습니다.");
      }

      const nextReference = {
        ...references[index],
        guideShape: request.guideShape,
      };
      references[index] = nextReference;
      return delay(nextReference);
    },
    async createInspectionSession(productUuid) {
      requireUser();
      const product = products.find((item) => item.productUuid === productUuid);
      if (!product) {
        throw new SanilApiError("not_found", "제품을 찾을 수 없습니다.");
      }
      const references = referencesFor(productUuid);
      if (references.length === 0) {
        throw new SanilApiError("validation", "등록된 기준 사진이 없어 검사를 시작할 수 없습니다.");
      }
      const timestamp = Date.now().toString(36);
      const session: InspectionSession = {
        inspectionSessionUuid: `session-${timestamp}`,
        productUuid,
        productCode: product.code,
        productName: product.name,
        round: 1,
        status: "PROCESSING",
        totalSteps: references.length,
        capturedSteps: 0,
        createdAt: now(),
        updatedAt: now(),
      };
      sessions.set(session.inspectionSessionUuid, { session, captures: new Map() });
      return delay(session);
    },
    async getInspectionSession(inspectionSessionUuid) {
      requireUser();
      if (inspectionSessionUuid === "session-history-001") {
        const item = fixtures.history[0];
        return delay({
          inspectionSessionUuid: item.inspectionSessionUuid,
          productUuid: "product-transformer-a",
          productCode: item.productCode,
          productName: item.productName,
          round: item.round,
          status: item.status,
          totalSteps: item.totalSteps,
          capturedSteps: item.capturedSteps,
          createdAt: item.updatedAt,
          updatedAt: item.updatedAt,
        });
      }
      return delay(getRecord(inspectionSessionUuid).session);
    },
    async getInspectionCaptureStep(inspectionSessionUuid, stepOrder) {
      requireUser();
      const record = getRecord(inspectionSessionUuid);
      const reference = referencesFor(record.session.productUuid).find((item) => item.stepOrder === stepOrder);
      if (!reference) {
        throw new SanilApiError("not_found", "촬영 단계를 찾을 수 없습니다.");
      }
      return delay<InspectionCaptureStep>({
        inspectionSessionUuid,
        stepOrder,
        reference,
        inspected: record.captures.get(reference.referenceUuid) ?? null,
        comparisonStatus: record.captures.has(reference.referenceUuid) ? "PROCESSED" : "NOT_STARTED",
      });
    },
    async confirmInspectionCapture(request: ConfirmInspectionCaptureRequest) {
      requireUser();
      const record = getRecord(request.inspectionSessionUuid);
      const reference = referencesFor(record.session.productUuid).find((item) => item.referenceUuid === request.referenceUuid);
      if (!reference || reference.stepOrder !== request.stepOrder) {
        throw new SanilApiError("conflict", "현재 촬영 단계와 기준 사진이 일치하지 않습니다.");
      }
      if (request.imageFile.size === 0) {
        throw new SanilApiError("validation", "촬영 이미지가 비어 있습니다.");
      }
      const inspectedImage = makeInspectionImage(reference.referenceUuid);
      const capture: InspectionCapture = {
        inspectedUuid: `inspected-${request.referenceUuid}`,
        inspectionSessionUuid: request.inspectionSessionUuid,
        referenceUuid: request.referenceUuid,
        image: inspectedImage,
        round: 1,
        status: reference.referenceUuid === "reference-transformer-marker" ? "NEEDS_REVIEW" : "PASSED",
      };
      record.captures.set(reference.referenceUuid, capture);
      refreshSession(record);
      return delay<ConfirmInspectionCaptureResponse>({
        inspectionSessionUuid: request.inspectionSessionUuid,
        stepOrder: reference.stepOrder,
        inspectedUuid: capture.inspectedUuid,
        inspectedImage,
        comparisonStatus: "QUEUED",
      });
    },
    async getInspectionResult(inspectionSessionUuid) {
      requireUser();
      const historicalResult = getHistoricalResult(inspectionSessionUuid);
      if (historicalResult) {
        return delay(historicalResult);
      }
      const record = getRecord(inspectionSessionUuid);
      const references = referencesFor(record.session.productUuid);
      if (record.captures.size < references.length) {
        throw new SanilApiError("conflict", "모든 촬영이 완료된 뒤 결과를 조회할 수 있습니다.");
      }
      const items: InspectionResultItem[] = references.map((reference) => {
        const capture = record.captures.get(reference.referenceUuid);
        if (!capture) {
          throw new SanilApiError("server", "검사 결과 집계 중 촬영 누락이 발견되었습니다.");
        }
        return {
          inspectedUuid: capture.inspectedUuid,
          referenceUuid: reference.referenceUuid,
          referenceImage: reference.image,
          inspectedImage: capture.image,
          status: capture.status,
          findings: fixtures.findings[reference.referenceUuid] ?? [],
          summary: capture.status === "PASSED" ? "기준 사진 대비 주요 차이가 없습니다." : "마커 정렬 확인이 필요합니다.",
        };
      });
      return delay<InspectionResultSummary>({
        inspectionSessionUuid,
        status: items.some((item) => item.status === "NEEDS_REVIEW") ? "NEEDS_REVIEW" : "PASSED",
        completedAt: now(),
        items,
      });
    },
    async listInspectionHistory() {
      requireUser();
      const active: InspectionHistoryItem[] = Array.from(sessions.values()).map(({ session }) => ({
        inspectionSessionUuid: session.inspectionSessionUuid,
        productCode: session.productCode,
        productName: session.productName,
        status: session.status,
        round: session.round,
        capturedSteps: session.capturedSteps,
        totalSteps: session.totalSteps,
        updatedAt: session.updatedAt,
      }));
      return delay([...active, ...fixtures.history]);
    },
  };
}
