export type CameraPermissionState = "unknown" | "granted" | "denied" | "unsupported";

export interface CapturedImage {
  file: File;
  previewUrl: string;
}

export interface CameraAdapter {
  getPermissionState(): Promise<CameraPermissionState>;
  captureFrame(): Promise<CapturedImage>;
  dispose(): void;
}
