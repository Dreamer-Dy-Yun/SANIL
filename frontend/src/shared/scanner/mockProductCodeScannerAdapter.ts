import type { CameraAdapter } from "../camera/cameraAdapter";
import type { ProductCodeScannerAdapter, ProductCodeScanFormat } from "./productCodeScannerAdapter";

export interface CreateMockProductCodeScannerAdapterOptions {
  cameraAdapter: CameraAdapter;
  scanFixture: {
    rawValue: string;
    format: ProductCodeScanFormat;
  };
}

export function createMockProductCodeScannerAdapter(
  options: CreateMockProductCodeScannerAdapterOptions,
): ProductCodeScannerAdapter {
  return {
    async captureProductCode() {
      const capturedImage = await options.cameraAdapter.captureFrame();
      return {
        rawValue: options.scanFixture.rawValue,
        format: options.scanFixture.format,
        capturedImage,
      };
    },
    dispose() {
      options.cameraAdapter.dispose();
    },
  };
}
