import { ClipboardCheck, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import type { ProductSummary } from "../../api/contracts";

export function ProductsPage() {
  const { apiClient } = useFrontendServices();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    apiClient.listProducts().then(setProducts).catch(setError);
  }, [apiClient]);

  const startInspection = async (productUuid: string) => {
    setError(null);
    try {
      const session = await apiClient.createInspectionSession(productUuid);
      navigate(`/inspections/${session.inspectionSessionUuid}/capture/1`);
    } catch (nextError) {
      setError(nextError);
    }
  };

  if (error) return <ErrorState error={error} />;
  if (!products) return <LoadingState label="제품 목록을 불러오는 중" />;

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <span className="eyebrow">Product Selection</span>
          <h1>검사할 제품 선택</h1>
        </div>
      </header>
      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.productUuid}>
            <div className="product-card__icon">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h2>{product.code}</h2>
              <p>{product.name}</p>
              <small>{product.remarks}</small>
            </div>
            <div className="product-card__meta">
              <span>{product.referenceCount}개 기준 사진</span>
              <Link to={`/products/${product.productUuid}/references`}>
                <Images size={16} />
                기준 사진
              </Link>
            </div>
            <button type="button" className="primary-button" onClick={() => void startInspection(product.productUuid)}>
              검사 시작
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
