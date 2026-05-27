import { ArrowRight, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import type { InspectionResultSummary, InspectionSession } from "../../api/contracts";

export function ProcessingPage() {
  const { inspectionSessionUuid = "" } = useParams();
  const { apiClient } = useFrontendServices();
  const navigate = useNavigate();
  const [session, setSession] = useState<InspectionSession | null>(null);
  const [result, setResult] = useState<InspectionResultSummary | null>(null);
  const [error, setError] = useState<unknown>(null);

  const load = () => {
    setError(null);
    Promise.all([apiClient.getInspectionSession(inspectionSessionUuid), apiClient.getInspectionResult(inspectionSessionUuid)])
      .then(([nextSession, nextResult]) => {
        setSession(nextSession);
        setResult(nextResult);
      })
      .catch(setError);
  };

  useEffect(load, [apiClient, inspectionSessionUuid]);

  if (error) return <ErrorState error={error} />;
  if (!session || !result) return <LoadingState label="비교 결과를 집계하는 중" />;

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <span className="eyebrow">Processing</span>
          <h1>모든 촬영이 완료되었습니다</h1>
        </div>
      </header>
      <div className="summary-band">
        <strong>{session.productCode}</strong>
        <span>
          {session.capturedSteps} / {session.totalSteps} 촬영 완료
        </span>
        <span>{result.items.length}개 비교 결과 준비</span>
      </div>
      <div className="action-row">
        <button type="button" className="secondary-button" onClick={load}>
          <RefreshCw size={18} />
          새로고침
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate(`/inspections/${inspectionSessionUuid}/result`)}
        >
          <ArrowRight size={18} />
          최종 결과 보기
        </button>
      </div>
    </section>
  );
}
