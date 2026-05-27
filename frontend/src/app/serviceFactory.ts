import { createSanilApiClient } from "../api/client";
import { createMockCameraAdapter } from "../shared/camera/mockCameraAdapter";
import { mockProductCodeScanFixture } from "../shared/scanner/mockProductCodeScanFixture";
import { createMockProductCodeScannerAdapter } from "../shared/scanner/mockProductCodeScannerAdapter";
import type { FrontendServices } from "./serviceTypes";

export function createFrontendServices(): FrontendServices {
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";
  const cameraAdapter = createMockCameraAdapter();
  return {
    apiClient: createSanilApiClient({
      mode: useMockApi ? "mock" : "http",
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? null,
    }),
    cameraAdapter,
    productCodeScannerAdapter: createMockProductCodeScannerAdapter({
      cameraAdapter,
      scanFixture: mockProductCodeScanFixture,
    }),
  };
}
