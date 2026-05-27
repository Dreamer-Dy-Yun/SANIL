import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import { GuideOverlay } from "../../shared/components/GuideOverlay";
import { LoadingState } from "../../shared/components/LoadingState";
import { StatusBadge } from "../../shared/components/StatusBadge";
import type { InspectionResultSummary, ReferenceShot } from "../../api/contracts";

export function ResultPage() {
  const { inspectionSessionUuid = "" } = useParams();
  const { apiClient } = useFrontendServices();
  const [result, setResult] = useState<InspectionResultSummary | null>(null);
  const [references, setReferences] = useState<ReferenceShot[]>([]);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    apiClient
      .getInspectionResult(inspectionSessionUuid)
      .then(async (nextResult) => {
        setResult(nextResult);
        const session = await apiClient.getInspectionSession(inspectionSessionUuid);
        setReferences(await apiClient.listReferenceShots(session.productUuid));
      })
      .catch(setError);
  }, [apiClient, inspectionSessionUuid]);

  if (error) return <ErrorState error={error} />;
  if (!result) return <LoadingState label="최종 결과를 불러오는 중" />;

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <span className="eyebrow">Inspection Result</span>
          <h1>최종 검사 결과</h1>
        </div>
        <StatusBadge status={result.status} />
      </header>
      <div className="result-list">
        {result.items.map((item) => {
          const reference = references.find((entry) => entry.referenceUuid === item.referenceUuid);
          return (
            <article className="result-item" key={item.inspectedUuid}>
              <div className="result-images">
                <figure>
                  {item.referenceImage ? <img src={item.referenceImage.imageUrl} alt="기준 사진" /> : null}
                  <figcaption>기준</figcaption>
                </figure>
                <figure className="result-inspected">
                  <img src={item.inspectedImage.imageUrl} alt="QA 대상" />
                  <GuideOverlay guideShape={reference?.guideShape ?? null} />
                  <figcaption>QA 대상</figcaption>
                </figure>
              </div>
              <div className="result-copy">
                <StatusBadge status={item.status} />
                <h2>{summaryTitle(item.status)}</h2>
                <p>{item.summary}</p>
                {item.findings.map((finding, index) => (
                  <div className="finding" key={`${item.inspectedUuid}-${index}`}>
                    <strong>{finding.judge}</strong>
                    <span>{finding.detail.criteria}</span>
                    <p>{finding.detail.reason}</p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function summaryTitle(status: string) {
  if (status === "NEEDS_REVIEW") return "사람 검토 필요";
  if (status === "PASSED") return "기준 대비 주요 차이 없음";
  if (status === "FAILED") return "처리 실패";
  if (status === "REJECTED") return "불합격";
  return "상태 확인";
}
