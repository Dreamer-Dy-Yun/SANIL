import { SanilApiError } from "../../errors";
import type { SanilApiClient } from "../../contracts";

export interface CreateHttpSanilApiClientOptions {
  apiBaseUrl: string;
}

export function createHttpSanilApiClient(_options: CreateHttpSanilApiClientOptions): SanilApiClient {
  const unavailable = async (): Promise<never> => {
    throw new SanilApiError("server", "백엔드 API 계약은 아직 구현되지 않았습니다.");
  };

  return {
    login: unavailable,
    getCurrentUser: unavailable,
    listProducts: unavailable,
    listReferenceShots: unavailable,
    createReferenceShot: unavailable,
    updateReferenceGuideShape: unavailable,
    createInspectionSession: unavailable,
    getInspectionSession: unavailable,
    getInspectionCaptureStep: unavailable,
    confirmInspectionCapture: unavailable,
    getInspectionResult: unavailable,
    listInspectionHistory: unavailable,
  };
}
