import { GuideOverlay } from "../../shared/components/GuideOverlay";
import type { ReferenceShot } from "../../api/contracts";

interface ReferenceShotListProps {
  references: ReferenceShot[];
  emptyLabel: string;
  listLabel?: string;
  contextLabel?: string;
}

export function ReferenceShotList({ references, emptyLabel, listLabel, contextLabel }: ReferenceShotListProps) {
  if (references.length === 0) {
    return <div className="state-panel">{emptyLabel}</div>;
  }

  return (
    <div className="reference-list" aria-label={listLabel}>
      {references.map((reference) => (
        <article className="reference-row" key={reference.referenceUuid}>
          <div className="reference-thumb">
            {reference.image ? <img src={reference.image.imageUrl} alt={reference.name} /> : null}
            <GuideOverlay guideShape={reference.guideShape} />
          </div>
          <div>
            {contextLabel ? <span className="eyebrow">{contextLabel}</span> : null}
            <span className="step-pill">STEP {reference.stepOrder}</span>
            <h2>{reference.name}</h2>
            {reference.remarks ? <p>{reference.remarks}</p> : null}
            <small>
              {reference.image ? "기준 이미지 등록됨" : "기준 이미지 없음"} ·{" "}
              {reference.guideShape ? "가이드 영역 등록됨" : "가이드 영역 없음"}
            </small>
          </div>
        </article>
      ))}
    </div>
  );
}
