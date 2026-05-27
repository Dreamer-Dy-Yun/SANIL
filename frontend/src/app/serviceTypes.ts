import type { SanilApiClient } from "../api/contracts";
import type { CameraAdapter } from "../shared/camera/cameraAdapter";

export interface FrontendServices {
  apiClient: SanilApiClient;
  cameraAdapter: CameraAdapter;
}
