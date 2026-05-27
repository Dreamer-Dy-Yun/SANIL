import { ClipboardCheck, Images, ListChecks, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { toApiError } from "../../api/errors";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import type { ProductSummary } from "../../api/contracts";

type ProductSelectionMode = "dropdown" | "scan";

export function ProductsPage() {
  const { apiClient, productCodeScannerAdapter } = useFrontendServices();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [selectionMode, setSelectionMode] = useState<ProductSelectionMode>("dropdown");
  const [selectedProductUuid, setSelectedProductUuid] = useState("");
  const [scannedProduct, setScannedProduct] = useState<ProductSummary | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    apiClient
      .listProducts()
      .then((nextProducts) => {
        setProducts(nextProducts);
        setSelectedProductUuid((currentValue) => currentValue || nextProducts[0]?.productUuid || "");
      })
      .catch(setError);
  }, [apiClient]);

  const startInspection = async (productUuid: string) => {
    setActionMessage(null);
    setIsBusy(true);
    try {
      const session = await apiClient.createInspectionSession(productUuid);
      navigate(`/inspections/${session.inspectionSessionUuid}/capture/1`);
    } catch (nextError) {
      setActionMessage(toApiError(nextError).message);
    } finally {
      setIsBusy(false);
    }
  };

  const startSelectedInspection = () => {
    if (!selectedProductUuid) {
      setActionMessage("검사할 제품을 선택해야 합니다.");
      return;
    }
    void startInspection(selectedProductUuid);
  };

  const scanProductCode = async () => {
    setActionMessage(null);
    setScannedProduct(null);
    setIsBusy(true);

    try {
      const scanResult = await productCodeScannerAdapter.captureProductCode();
      const product = await apiClient.findProductByCode(scanResult.rawValue);
      setScannedProduct(product);
      setSelectedProductUuid(product.productUuid);
    } catch (nextError) {
      setActionMessage(toApiError(nextError).message);
    } finally {
      setIsBusy(false);
    }
  };

  if (error) return <ErrorState error={error} />;
  if (!products) return <LoadingState label="제품 목록을 불러오는 중" />;

  const selectedProduct = products.find((product) => product.productUuid === selectedProductUuid) ?? null;

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <span className="eyebrow">Product Selection</span>
          <h1>검사할 제품 선택</h1>
        </div>
      </header>
      <div className="product-selection-panel">
        <div className="selection-mode" role="tablist" aria-label="제품 선택 방식">
          <button
            className={selectionMode === "dropdown" ? "mode-button mode-button--active" : "mode-button"}
            type="button"
            onClick={() => setSelectionMode("dropdown")}
          >
            <ListChecks size={18} />
            드롭다운
          </button>
          <button
            className={selectionMode === "scan" ? "mode-button mode-button--active" : "mode-button"}
            type="button"
            onClick={() => setSelectionMode("scan")}
          >
            <QrCode size={18} />
            바코드/QR 촬영
          </button>
        </div>

        {selectionMode === "dropdown" ? (
          <div className="selection-body">
            <label>
              제품
              <select value={selectedProductUuid} onChange={(event) => setSelectedProductUuid(event.target.value)}>
                {products.map((product) => (
                  <option key={product.productUuid} value={product.productUuid}>
                    {product.code} {product.name ? `- ${product.name}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" disabled={isBusy} type="button" onClick={startSelectedInspection}>
              검사 시작
            </button>
          </div>
        ) : (
          <div className="selection-body selection-body--scan">
            <button className="primary-button" disabled={isBusy} type="button" onClick={() => void scanProductCode()}>
              <QrCode size={18} />
              {isBusy ? "촬영 중" : "바코드/QR 촬영"}
            </button>
            {scannedProduct ? (
              <div className="scan-result">
                <strong>{scannedProduct.code}</strong>
                <span>{scannedProduct.name}</span>
                <button
                  className="secondary-button"
                  disabled={isBusy}
                  type="button"
                  onClick={() => void startInspection(scannedProduct.productUuid)}
                >
                  스캔 제품으로 검사 시작
                </button>
              </div>
            ) : null}
          </div>
        )}

        {selectedProduct ? (
          <p className="selection-summary">
            선택 제품: <strong>{selectedProduct.code}</strong> {selectedProduct.name}
          </p>
        ) : null}
        {actionMessage ? <p className="form-message form-message--error">{actionMessage}</p> : null}
      </div>
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
            <button
              type="button"
              className="primary-button"
              disabled={isBusy}
              onClick={() => void startInspection(product.productUuid)}
            >
              검사 시작
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
