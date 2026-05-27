import { createHttpSanilApiClient } from "./adapters/http/createHttpSanilApiClient";
import { createMockSanilApiClient } from "./adapters/mock/createMockSanilApiClient";
import { sanilMockFixtures } from "./mock/fixtures/sanilFixtures";
import type { SanilApiClient } from "./contracts";

export type ApiRuntimeMode = "mock" | "http";

export interface CreateSanilApiClientOptions {
  mode: ApiRuntimeMode;
  apiBaseUrl: string | null;
}

export function createSanilApiClient(options: CreateSanilApiClientOptions): SanilApiClient {
  if (options.mode === "mock") {
    return createMockSanilApiClient({ fixtures: sanilMockFixtures });
  }

  if (!options.apiBaseUrl) {
    throw new Error("HTTP API mode requires VITE_API_BASE_URL.");
  }

  return createHttpSanilApiClient({ apiBaseUrl: options.apiBaseUrl });
}
