import { Play, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toApiError } from "../../api/errors";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import type { ProductSummary } from "../../api/contracts";
import type { ProductCodeScanResult } from "../../shared/scanner/productCodeScannerAdapter";

type BusyAction = "scan" | "start";

interface FormMessage {
  tone: "success" | "error";
  text: string;
}

function formatProductLabel(product: ProductSummary) {
  return product.name ? `${product.code} - ${product.name}` : product.code;
}

function formatScanFormat(format: ProductCodeScanResult["format"]) {
  return format === "qr" ? "QR" : "Barcode";
}

export function ProductsPage() {
  const { apiClient, productCodeScannerAdapter } = useFrontendServices();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [selectedProductUuid, setSelectedProductUuid] = useState("");
  const [formMessage, setFormMessage] = useState<FormMessage | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);
  const [lastScanResult, setLastScanResult] = useState<ProductCodeScanResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .listProducts()
      .then((nextProducts) => {
        if (!isMounted) return;
        setProducts(nextProducts);
      })
      .catch((nextError: unknown) => {
        if (!isMounted) return;
        setError(nextError);
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  const isBusy = busyAction !== null;
  const selectedProduct = products?.find((product) => product.productUuid === selectedProductUuid) ?? null;
  const selectedProductLabel = selectedProduct ? formatProductLabel(selectedProduct) : "선택된 제품 없음";
  const scanStatusLabel = lastScanResult ? formatScanFormat(lastScanResult.format) : "Barcode/QR";
  const primaryActionLabel = selectedProduct
    ? busyAction === "start"
      ? "시작 중"
      : "검사 시작"
    : busyAction === "scan"
      ? "판독 중"
      : "코드 촬영";
  const PrimaryActionIcon = selectedProduct ? Play : QrCode;

  const startSelectedInspection = async () => {
    if (!selectedProduct) {
      setFormMessage({ tone: "error", text: "검사할 제품을 선택해야 합니다." });
      return;
    }

    setFormMessage(null);
    setBusyAction("start");
    try {
      const session = await apiClient.createInspectionSession(selectedProduct.productUuid);
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
      setLastScanResult(scanResult);
      const product = await apiClient.findProductByCode(scanResult.rawValue);
      setProducts((currentProducts) => {
        if (!currentProducts) {
          return [product];
        }
        if (currentProducts.some((item) => item.productUuid === product.productUuid)) {
          return currentProducts;
        }
        return [...currentProducts, product];
      });
      setSelectedProductUuid(product.productUuid);
      setFormMessage({ tone: "success", text: `${product.code} 제품을 선택했습니다.` });
    } catch (nextError) {
      const apiError = toApiError(nextError);
      if (apiError.kind === "not_found" || apiError.kind === "validation") {
        setSelectedProductUuid("");
      }
      setFormMessage({ tone: "error", text: apiError.message });
    } finally {
      setBusyAction(null);
    }
  };

  const runPrimaryAction = async () => {
    if (selectedProduct) {
      await startSelectedInspection();
      return;
    }

    await scanProductCode();
  };

  if (error) return <ErrorState error={error} />;
  if (!products) return <LoadingState label="제품 목록을 불러오는 중" />;

  return (
    <section className="page-section product-operator-section">
      <header className="page-header product-operator-header">
        <div>
          <span className="eyebrow">Product Selection</span>
          <h1>작업 제품 선택</h1>
        </div>
        <div className="operator-product-state" aria-live="polite">
          <span>{products.length}개 제품</span>
          <strong>{selectedProduct ? selectedProduct.code : "미선택"}</strong>
        </div>
      </header>

      <div className="product-selection-panel operator-product-panel">
        <div className="selection-body operator-selection-strip">
          <label className="operator-product-select" htmlFor="product-select">
            <span>제품</span>
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
                  {formatProductLabel(product)}
                </option>
              ))}
            </select>
          </label>

          <div className="operator-selected-product" aria-live="polite">
            <span>현재 선택</span>
            <strong>{selectedProductLabel}</strong>
            <small>{selectedProduct ? `${selectedProduct.referenceCount}개 기준 사진` : "제품 선택 후 검사 시작 가능"}</small>
          </div>
        </div>

        <div className="scanner-camera-panel operator-scanner-panel" aria-label="바코드/QR 카메라">
          <div className="scanner-camera-toolbar">
            <div>
              <span>코드 판독</span>
              <strong>{scanStatusLabel}</strong>
            </div>
            {lastScanResult ? <span>{lastScanResult.rawValue}</span> : <span>카메라 대기</span>}
          </div>
          <div className={lastScanResult ? "scanner-viewport scanner-viewport--captured" : "scanner-viewport"}>
            {lastScanResult ? <img src={lastScanResult.capturedImage.previewUrl} alt="촬영된 바코드/QR 이미지" /> : null}
            <div className="scanner-reticle" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="scanner-surface-copy" aria-hidden="true">
              <strong>{lastScanResult ? lastScanResult.rawValue : "READY"}</strong>
              <span>{lastScanResult ? "촬영 결과" : "제품 코드"}</span>
            </div>
          </div>
        </div>

        <div className="product-action-bar operator-action-bar">
          <button className="primary-button operator-primary-action" disabled={isBusy} type="button" onClick={() => void runPrimaryAction()}>
            <PrimaryActionIcon size={22} />
            {primaryActionLabel}
          </button>
        </div>

        {formMessage ? <p className={`form-message form-message--${formMessage.tone}`}>{formMessage.text}</p> : null}
      </div>
    </section>
  );
}
