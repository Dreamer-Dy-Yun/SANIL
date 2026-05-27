import { describe, expect, it } from "vitest";
import { validateGuideShape } from "./guideShape";
import type { ReferenceGuideShape } from "../../api/contracts";

describe("validateGuideShape", () => {
  it("accepts ratio guide shapes", () => {
    const shape: ReferenceGuideShape = {
      version: 1,
      origin: "top_left",
      unit: "ratio",
      source: { imageUuid: "image-1" },
      shapes: [{ shapeType: "box", label: "box", box: { x: 0.1, y: 0.2, w: 0.3, h: 0.4 } }],
    };

    expect(validateGuideShape(shape)).toEqual([]);
  });

  it("rejects coordinates outside ratio range", () => {
    const shape: ReferenceGuideShape = {
      version: 1,
      origin: "top_left",
      unit: "ratio",
      source: { imageUuid: "image-1" },
      shapes: [{ shapeType: "line", label: null, start: { x: -0.1, y: 0.2 }, end: { x: 0.5, y: 1.2 } }],
    };

    expect(validateGuideShape(shape)).toHaveLength(2);
  });
});
