import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import type { ReferenceShot } from "../../api/contracts";
import { ReferenceShotList } from "./ReferenceShotList";

export function ReferenceListPage() {
  const { productUuid = "" } = useParams();
  const { apiClient } = useFrontendServices();
  const [references, setReferences] = useState<ReferenceShot[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    apiClient.listReferenceShots(productUuid).then(setReferences).catch(setError);
  }, [apiClient, productUuid]);

  if (error) return <ErrorState error={error} />;
  if (!references) return <LoadingState label="기준 사진을 불러오는 중" />;

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <span className="eyebrow">Reference Shots</span>
          <h1>기준 사진과 촬영 가이드</h1>
        </div>
      </header>
      <ReferenceShotList references={references} emptyLabel="등록된 기준 사진이 없습니다." />
    </section>
  );
}
