import type { CapturedImage } from "../camera/cameraAdapter";

export type ProductCodeScanFormat = "barcode" | "qr";

export interface ProductCodeScanResult {
  rawValue: string;
  format: ProductCodeScanFormat;
  capturedImage: CapturedImage;
}

export interface ProductCodeScannerAdapter {
  captureProductCode(): Promise<ProductCodeScanResult>;
  dispose(): void;
}
