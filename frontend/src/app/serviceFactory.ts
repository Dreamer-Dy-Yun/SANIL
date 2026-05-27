import { createSanilApiClient } from "../api/client";
import { createMockCameraAdapter } from "../shared/camera/mockCameraAdapter";
import type { FrontendServices } from "./serviceTypes";

export function createFrontendServices(): FrontendServices {
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";
  return {
    apiClient: createSanilApiClient({
      mode: useMockApi ? "mock" : "http",
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? null,
    }),
    cameraAdapter: createMockCameraAdapter(),
  };
}
