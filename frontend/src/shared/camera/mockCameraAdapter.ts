import type { CameraAdapter, CameraPermissionState, CapturedImage } from "./cameraAdapter";

const MOCK_CAPTURE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="960" viewBox="0 0 1280 960">
  <rect width="1280" height="960" fill="#23342c"/>
  <rect x="180" y="160" width="920" height="620" rx="24" fill="#d7ded8"/>
  <rect x="240" y="230" width="800" height="470" rx="14" fill="#eff2ed"/>
  <circle cx="350" cy="340" r="58" fill="#637267"/>
  <circle cx="930" cy="340" r="58" fill="#637267"/>
  <circle cx="350" cy="610" r="58" fill="#637267"/>
  <circle cx="930" cy="610" r="58" fill="#637267"/>
  <path d="M520 480h240" stroke="#d94d3f" stroke-width="28" stroke-linecap="round"/>
  <text x="640" y="820" text-anchor="middle" font-family="Arial" font-size="42" fill="#f2f5ef">MOCK CAPTURE</text>
</svg>`;

export function createMockCameraAdapter(): CameraAdapter {
  let lastUrl: string | null = null;

  return {
    async getPermissionState(): Promise<CameraPermissionState> {
      return "granted";
    },
    async captureFrame(): Promise<CapturedImage> {
      if (lastUrl) {
        URL.revokeObjectURL(lastUrl);
      }

      const file = new File([MOCK_CAPTURE_SVG], `mock-capture-${Date.now()}.svg`, { type: "image/svg+xml" });
      lastUrl = URL.createObjectURL(file);
      return { file, previewUrl: lastUrl };
    },
    dispose() {
      if (lastUrl) {
        URL.revokeObjectURL(lastUrl);
        lastUrl = null;
      }
    },
  };
}
