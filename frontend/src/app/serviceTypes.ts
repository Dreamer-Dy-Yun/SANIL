import type { SanilApiClient } from "../api/contracts";
import type { CameraAdapter } from "../shared/camera/cameraAdapter";
import type { ProductCodeScannerAdapter } from "../shared/scanner/productCodeScannerAdapter";

export interface FrontendServices {
  apiClient: SanilApiClient;
  cameraAdapter: CameraAdapter;
  productCodeScannerAdapter: ProductCodeScannerAdapter;
}
