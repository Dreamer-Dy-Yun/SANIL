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
    <section className="page-section">
      <header className="page-header">
        <div>
          <span className="eyebrow">History</span>
          <h1>검사 이력</h1>
        </div>
      </header>
      <div className="history-table">
        {items.map((item) => (
          <article className="history-row" key={item.inspectionSessionUuid}>
            <div>
              <strong>{item.productCode}</strong>
              <span>{item.productName}</span>
            </div>
            <StatusBadge status={item.status} />
            <span>
              {item.capturedSteps} / {item.totalSteps}
            </span>
            <time>{new Date(item.updatedAt).toLocaleString("ko-KR")}</time>
            <Link to={`/inspections/${item.inspectionSessionUuid}/result`}>상세</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
