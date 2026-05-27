import type {
  CurrentUser,
  ImageAsset,
  InspectionFinding,
  InspectionHistoryItem,
  ProductSummary,
  ReferenceShot,
} from "../../contracts";

const image = (imageUuid: string, originalFilename: string, width = 1280, height = 960): ImageAsset => ({
  imageUuid,
  originalFilename,
  mimeType: "image/svg+xml",
  width,
  height,
  imageUrl: `${import.meta.env.BASE_URL}mock-images/${originalFilename}`,
  thumbnailUrl: `${import.meta.env.BASE_URL}mock-images/${originalFilename}`,
});

export const mockUser: CurrentUser = {
  userUuid: "user-admin-001",
  loginId: "qa.admin",
  name: "QA 관리자",
  authority: "ADMIN",
};

export const mockProducts: ProductSummary[] = [
  {
    productUuid: "product-transformer-a",
    code: "SANIL-TR-100",
    name: "수출형 변압기 커버 조립체",
    remarks: "마커, 볼트 체결, 라벨 위치 확인",
    referenceCount: 3,
  },
  {
    productUuid: "product-panel-b",
    code: "SANIL-PN-220",
    name: "배전반 전면 패널",
    remarks: "스위치 캡, 명판, 단자 보호 커버 확인",
    referenceCount: 2,
  },
];

const referenceImages = {
  transformerTop: image("image-reference-top", "reference-transformer-top.svg"),
  transformerMarker: image("image-reference-marker", "reference-transformer-marker.svg"),
  transformerLabel: image("image-reference-label", "reference-transformer-label.svg"),
  panelFront: image("image-reference-panel-front", "reference-panel-front.svg"),
  panelTerminal: image("image-reference-panel-terminal", "reference-panel-terminal.svg"),
};

export const mockReferences: ReferenceShot[] = [
  {
    referenceUuid: "reference-transformer-top",
    productUuid: "product-transformer-a",
    image: referenceImages.transformerTop,
    name: "상부 커버 체결부",
    stepOrder: 1,
    remarks: "네 모서리 볼트와 커버 들뜸 여부를 기준선에 맞춰 촬영",
    guideShape: {
      version: 1,
      origin: "top_left",
      unit: "ratio",
      source: { imageUuid: referenceImages.transformerTop.imageUuid },
      shapes: [{ shapeType: "box", label: "커버 외곽", box: { x: 0.12, y: 0.15, w: 0.76, h: 0.62 } }],
    },
  },
  {
    referenceUuid: "reference-transformer-marker",
    productUuid: "product-transformer-a",
    image: referenceImages.transformerMarker,
    name: "체결 마커 정렬",
    stepOrder: 2,
    remarks: "마커 위치가 허용 범위 내인지 확인할 수 있게 정면 촬영",
    guideShape: {
      version: 1,
      origin: "top_left",
      unit: "ratio",
      source: { imageUuid: referenceImages.transformerMarker.imageUuid },
      shapes: [{ shapeType: "line", label: "마커 기준선", start: { x: 0.28, y: 0.5 }, end: { x: 0.72, y: 0.5 } }],
    },
  },
  {
    referenceUuid: "reference-transformer-label",
    productUuid: "product-transformer-a",
    image: referenceImages.transformerLabel,
    name: "라벨 부착 위치",
    stepOrder: 3,
    remarks: "라벨 누락, 기울어짐, 오염 여부 확인",
    guideShape: {
      version: 1,
      origin: "top_left",
      unit: "ratio",
      source: { imageUuid: referenceImages.transformerLabel.imageUuid },
      shapes: [{ shapeType: "box", label: "라벨 위치", box: { x: 0.32, y: 0.35, w: 0.36, h: 0.2 } }],
    },
  },
  {
    referenceUuid: "reference-panel-front",
    productUuid: "product-panel-b",
    image: referenceImages.panelFront,
    name: "전면 스위치 배열",
    stepOrder: 1,
    remarks: "스위치 캡 누락과 명판 위치 확인",
    guideShape: {
      version: 1,
      origin: "top_left",
      unit: "ratio",
      source: { imageUuid: referenceImages.panelFront.imageUuid },
      shapes: [{ shapeType: "box", label: "스위치 영역", box: { x: 0.18, y: 0.22, w: 0.64, h: 0.42 } }],
    },
  },
  {
    referenceUuid: "reference-panel-terminal",
    productUuid: "product-panel-b",
    image: referenceImages.panelTerminal,
    name: "단자 보호 커버",
    stepOrder: 2,
    remarks: "보호 커버 체결과 경고 라벨 상태 확인",
    guideShape: {
      version: 1,
      origin: "top_left",
      unit: "ratio",
      source: { imageUuid: referenceImages.panelTerminal.imageUuid },
      shapes: [{ shapeType: "box", label: "단자 커버", box: { x: 0.2, y: 0.28, w: 0.6, h: 0.48 } }],
    },
  },
];

export const mockInspectionImages = {
  ok: image("image-inspected-ok", "inspected-ok.svg"),
  markerNg: image("image-inspected-marker-ng", "inspected-marker-ng.svg"),
  labelOk: image("image-inspected-label-ok", "inspected-label-ok.svg"),
};

export const findingPresets: Record<string, InspectionFinding[]> = {
  "reference-transformer-marker": [
    {
      coordinate: { origin: "top_left", unit: "ratio", x: 0.43, y: 0.45, w: 0.16, h: 0.12 },
      detail: {
        criteria: "체결 마커 위치 어긋남이 10도 이내일 것",
        observation: "마커 위치가 기준선 대비 약 35도 틀어짐",
        reason: "체결 허용 기준치 초과 가능성이 있어 검토가 필요함",
      },
      judge: "NG",
      confidence: 0.86,
    },
  ],
};

export const mockHistory: InspectionHistoryItem[] = [
  {
    inspectionSessionUuid: "session-history-001",
    productCode: "SANIL-TR-100",
    productName: "수출형 변압기 커버 조립체",
    status: "NEEDS_REVIEW",
    round: 1,
    capturedSteps: 3,
    totalSteps: 3,
    updatedAt: "2026-05-27T08:10:00.000Z",
  },
];

export const sanilMockFixtures = {
  user: mockUser,
  products: mockProducts,
  references: mockReferences,
  inspectionImages: mockInspectionImages,
  findings: findingPresets,
  history: mockHistory,
};
