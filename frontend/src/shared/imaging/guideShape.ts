import type { RatioPoint, ReferenceGuideShape } from "../../api/contracts";

export interface GuideShapeValidationIssue {
  path: string;
  message: string;
}

export interface ViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function validateGuideShape(shape: ReferenceGuideShape | null): GuideShapeValidationIssue[] {
  if (!shape) {
    return [];
  }

  const issues: GuideShapeValidationIssue[] = [];
  if (shape.origin !== "top_left") {
    issues.push({ path: "origin", message: "origin은 top_left만 허용됩니다." });
  }
  if (shape.unit !== "ratio") {
    issues.push({ path: "unit", message: "unit은 ratio만 허용됩니다." });
  }

  shape.shapes.forEach((item, index) => {
    const points =
      item.shapeType === "box"
        ? [
            { x: item.box.x, y: item.box.y },
            { x: item.box.x + item.box.w, y: item.box.y + item.box.h },
          ]
        : item.shapeType === "line"
          ? [item.start, item.end]
          : item.points;

    points.forEach((point, pointIndex) => {
      if (!isRatio(point.x) || !isRatio(point.y)) {
        issues.push({ path: `shapes.${index}.${pointIndex}`, message: "좌표는 0 이상 1 이하 ratio여야 합니다." });
      }
    });
  });

  return issues;
}

export function ratioToViewportPoint(point: RatioPoint, rect: ViewportRect): RatioPoint {
  return {
    x: rect.left + point.x * rect.width,
    y: rect.top + point.y * rect.height,
  };
}

function isRatio(value: number) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}
