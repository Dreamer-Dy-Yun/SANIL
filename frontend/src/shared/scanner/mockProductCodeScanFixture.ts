import type { ProductCodeScanFormat } from "./productCodeScannerAdapter";

export interface MockProductCodeScanFixture {
  rawValue: string;
  format: ProductCodeScanFormat;
}

export const mockProductCodeScanFixture: MockProductCodeScanFixture = {
  rawValue: "SANIL-TR-100",
  format: "qr",
};
