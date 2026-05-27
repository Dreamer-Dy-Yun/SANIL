import { ArrowRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

  const load = useCallback(() => {
    setError(null);
    Promise.all([apiClient.getInspectionSession(inspectionSessionUuid), apiClient.getInspectionResult(inspectionSessionUuid)])
      .then(([nextSession, nextResult]) => {
        setSession(nextSession);
        setResult(nextResult);
      })
      .catch(setError);
  }, [apiClient, inspectionSessionUuid]);

  useEffect(load, [load]);

  if (error) return <ErrorState error={error} />;
  if (!session || !result) return <LoadingState label="비교 결과를 집계하는 중" />;

  return (
    <section className="page-section inspection-operator-page">
      <header className="inspection-operator-header">
        <div>
          <span className="eyebrow">Inspection Processing</span>
          <h1>촬영본을 비교 처리 중입니다</h1>
          <p>합부 판정은 최종 결과 화면에서만 확인합니다.</p>
        </div>
      </header>

      <div className="operator-panel processing-panel">
        <div className="processing-indicator" aria-hidden="true">
          <RefreshCw size={42} />
        </div>
        <div>
          <span className="operator-kicker">{session.productCode}</span>
          <h2>검사 판정 확인 전 단계</h2>
          <p>모든 촬영 단계가 저장되었고 비교 결과 데이터를 수신했습니다.</p>
        </div>
        <dl className="operator-metrics">
          <div>
            <dt>촬영</dt>
            <dd>
              {session.capturedSteps} / {session.totalSteps}
            </dd>
          </div>
          <div>
            <dt>비교 항목</dt>
            <dd>{result.items.length}</dd>
          </div>
          <div>
            <dt>회차</dt>
            <dd>{session.round}</dd>
          </div>
        </dl>
      </div>

      <div className="operator-action-row">
        <button type="button" className="secondary-button" onClick={load}>
          <RefreshCw size={20} />
          새로고침
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => navigate(`/inspections/${inspectionSessionUuid}/result`)}
        >
          <ArrowRight size={20} />
          최종 결과 보기
        </button>
      </div>
    </section>
  );
}
