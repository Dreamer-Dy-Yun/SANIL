import { GuideOverlay } from "../../shared/components/GuideOverlay";
import type { ReferenceShot } from "../../api/contracts";

interface ReferenceShotListProps {
  references: ReferenceShot[];
  emptyLabel: string;
}

export function ReferenceShotList({ references, emptyLabel }: ReferenceShotListProps) {
  if (references.length === 0) {
    return <div className="state-panel">{emptyLabel}</div>;
  }

  return (
    <div className="reference-list">
      {references.map((reference) => (
        <article className="reference-row" key={reference.referenceUuid}>
          <div className="reference-thumb">
            {reference.image ? <img src={reference.image.imageUrl} alt={reference.name} /> : null}
            <GuideOverlay guideShape={reference.guideShape} />
          </div>
          <div>
            <span className="step-pill">STEP {reference.stepOrder}</span>
            <h2>{reference.name}</h2>
            <p>{reference.remarks}</p>
            <small>{reference.guideShape ? "ratio guide shape 등록됨" : "guide shape 없음"}</small>
          </div>
        </article>
      ))}
    </div>
  );
}
