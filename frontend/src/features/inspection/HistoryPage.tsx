import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import { StatusBadge } from "../../shared/components/StatusBadge";
import type { InspectionHistoryItem } from "../../api/contracts";

export function HistoryPage() {
  const { apiClient } = useFrontendServices();
  const [items, setItems] = useState<InspectionHistoryItem[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    apiClient.listInspectionHistory().then(setItems).catch(setError);
  }, [apiClient]);

  if (error) return <ErrorState error={error} />;
  if (!items) return <LoadingState label="검사 이력을 불러오는 중" />;

  return (
    <section className="page-section inspection-operator-page">
      <header className="inspection-operator-header">
        <div>
          <span className="eyebrow">Inspection History</span>
          <h1>검사 이력</h1>
          <p>최근 검사 세션의 최종 결과와 촬영 진행 상태를 확인합니다.</p>
        </div>
      </header>

      <div className="history-table">
        {items.map((item) => (
          <article className="history-row" key={item.inspectionSessionUuid}>
            <div className="history-row__main">
              <strong>{item.productCode}</strong>
              <span>{item.productName ?? "제품명 없음"}</span>
            </div>
            <div className="history-row__meta">
              <StatusBadge status={item.status} />
              <span>
                촬영 {item.capturedSteps} / {item.totalSteps}
              </span>
              <span>{item.round}회차</span>
              <time>{new Date(item.updatedAt).toLocaleString("ko-KR")}</time>
            </div>
            <Link className="secondary-button history-row__link" to={`/inspections/${item.inspectionSessionUuid}/result`}>
              상세 보기
              <ArrowRight size={18} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
