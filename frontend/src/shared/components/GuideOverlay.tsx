import type { ReferenceGuideShape } from "../../api/contracts";

interface GuideOverlayProps {
  guideShape: ReferenceGuideShape | null;
}

export function GuideOverlay({ guideShape }: GuideOverlayProps) {
  if (!guideShape) {
    return null;
  }

  return (
    <svg className="guide-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {guideShape.shapes.map((shape, index) => {
        if (shape.shapeType === "box") {
          return (
            <rect
              key={`${shape.shapeType}-${index}`}
              x={shape.box.x * 100}
              y={shape.box.y * 100}
              width={shape.box.w * 100}
              height={shape.box.h * 100}
              rx="1.2"
            />
          );
        }
        if (shape.shapeType === "line") {
          return (
            <line
              key={`${shape.shapeType}-${index}`}
              x1={shape.start.x * 100}
              y1={shape.start.y * 100}
              x2={shape.end.x * 100}
              y2={shape.end.y * 100}
            />
          );
        }
        const points = shape.points.map((point) => `${point.x * 100},${point.y * 100}`).join(" ");
        return <polygon key={`${shape.shapeType}-${index}`} points={points} />;
      })}
    </svg>
  );
}
