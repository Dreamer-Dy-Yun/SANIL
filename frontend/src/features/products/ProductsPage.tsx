import { Images, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toApiError } from "../../api/errors";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import type { ProductSummary } from "../../api/contracts";

type BusyAction = "scan" | "start";

interface FormMessage {
  tone: "success" | "error";
  text: string;
}

export function ProductsPage() {
  const { apiClient, productCodeScannerAdapter } = useFrontendServices();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [selectedProductUuid, setSelectedProductUuid] = useState("");
  const [formMessage, setFormMessage] = useState<FormMessage | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);

  useEffect(() => {
    apiClient
      .listProducts()
      .then((nextProducts) => {
        setProducts(nextProducts);
      })
      .catch(setError);
  }, [apiClient]);

  const isBusy = busyAction !== null;
  const selectedProduct = products?.find((product) => product.productUuid === selectedProductUuid) ?? null;

  const startSelectedInspection = async () => {
    if (!selectedProductUuid) {
      setFormMessage({ tone: "error", text: "검사할 제품을 선택해야 합니다." });
      return;
    }

    setFormMessage(null);
    setBusyAction("start");
    try {
      const session = await apiClient.createInspectionSession(selectedProductUuid);
      navigate(`/inspections/${session.inspectionSessionUuid}/capture/1`);
    } catch (nextError) {
      setFormMessage({ tone: "error", text: toApiError(nextError).message });
    } finally {
      setBusyAction(null);
    }
  };

  const scanProductCode = async () => {
    setFormMessage(null);
    setBusyAction("scan");

    try {
      const scanResult = await productCodeScannerAdapter.captureProductCode();
      const product = await apiClient.findProductByCode(scanResult.rawValue);
      setProducts((currentProducts) => {
        if (!currentProducts || currentProducts.some((item) => item.productUuid === product.productUuid)) {
          return currentProducts;
        }
        return [...currentProducts, product];
      });
      setSelectedProductUuid(product.productUuid);
      setFormMessage({ tone: "success", text: `${product.code} 제품을 선택했습니다.` });
    } catch (nextError) {
      setFormMessage({ tone: "error", text: toApiError(nextError).message });
    } finally {
      setBusyAction(null);
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

      <div className="product-selection-panel">
        <div className="selection-body">
          <label htmlFor="product-select">
            제품
            <select
              disabled={isBusy || products.length === 0}
              id="product-select"
              value={selectedProductUuid}
              onChange={(event) => {
                setSelectedProductUuid(event.target.value);
                setFormMessage(null);
              }}
            >
              <option value="">제품을 선택하세요</option>
              {products.map((product) => (
                <option key={product.productUuid} value={product.productUuid}>
                  {product.code} {product.name ? `- ${product.name}` : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="selection-actions">
            <button className="secondary-button" disabled={isBusy} type="button" onClick={() => void scanProductCode()}>
              <QrCode size={18} />
              {busyAction === "scan" ? "촬영 중" : "바코드/QR 촬영"}
            </button>
            <button
              className="primary-button"
              disabled={isBusy || products.length === 0}
              type="button"
              onClick={() => void startSelectedInspection()}
            >
              {busyAction === "start" ? "시작 중" : "검사 시작"}
            </button>
          </div>
        </div>

        {selectedProduct ? (
          <p className="selection-summary">
            <span>
              선택 제품: <strong>{selectedProduct.code}</strong> {selectedProduct.name}
            </span>
            <span>{selectedProduct.referenceCount}개 기준 사진</span>
            <Link to={`/products/${selectedProduct.productUuid}/references`}>
              <Images size={16} />
              기준 사진
            </Link>
          </p>
        ) : null}

        {formMessage ? <p className={`form-message form-message--${formMessage.tone}`}>{formMessage.text}</p> : null}
      </div>
    </section>
  );
}
