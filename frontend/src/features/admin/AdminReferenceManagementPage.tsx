import { type FormEvent, useEffect, useState } from "react";
import { useFrontendServices } from "../../app/serviceContext";
import { toApiError } from "../../api/errors";
import { ErrorState } from "../../shared/components/ErrorState";
import { LoadingState } from "../../shared/components/LoadingState";
import type { ProductSummary, ReferenceShot } from "../../api/contracts";
import { ReferenceShotList } from "../references/ReferenceShotList";

const getNextStepOrder = (references: ReferenceShot[]) =>
  references.reduce((maxOrder, reference) => Math.max(maxOrder, reference.stepOrder), 0) + 1;

export function AdminReferenceManagementPage() {
  const { apiClient } = useFrontendServices();
  const [products, setProducts] = useState<ProductSummary[] | null>(null);
  const [selectedProductUuid, setSelectedProductUuid] = useState("");
  const [references, setReferences] = useState<ReferenceShot[] | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [stepOrder, setStepOrder] = useState("1");
  const [remarks, setRemarks] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    apiClient
      .listProducts()
      .then((nextProducts) => {
        setProducts(nextProducts);
        setSelectedProductUuid((currentValue) => currentValue || nextProducts[0]?.productUuid || "");
      })
      .catch(setLoadError);
  }, [apiClient]);

  useEffect(() => {
    if (!selectedProductUuid) {
      setReferences([]);
      return;
    }

    setReferences(null);
    apiClient
      .listReferenceShots(selectedProductUuid)
      .then((nextReferences) => {
        setReferences(nextReferences);
        setStepOrder(String(getNextStepOrder(nextReferences)));
      })
      .catch(setLoadError);
  }, [apiClient, selectedProductUuid]);

  const submitReference = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!selectedProductUuid) {
      setSubmitError("제품을 선택해야 합니다.");
      return;
    }

    if (!imageFile) {
      setSubmitError("기준 사진 파일을 선택해야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nextReference = await apiClient.createReferenceShot({
        productUuid: selectedProductUuid,
        name,
        stepOrder: Number(stepOrder),
        remarks,
        imageFile,
      });
      const nextReferences = [...(references ?? []), nextReference].sort((a, b) => a.stepOrder - b.stepOrder);
      setReferences(nextReferences);
      setName("");
      setRemarks("");
      setImageFile(null);
      setStepOrder(String(getNextStepOrder(nextReferences)));
    } catch (nextError) {
      setSubmitError(toApiError(nextError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) return <ErrorState error={loadError} />;
  if (!products) return <LoadingState label="제품 목록을 불러오는 중" />;

  const selectedProduct = products.find((product) => product.productUuid === selectedProductUuid) ?? null;

  return (
    <section className="page-section">
      <header className="page-header">
        <div>
          <span className="eyebrow">Admin Reference Editing</span>
          <h1>관리자 기준 사진 편집</h1>
          <p>기준 사진 등록과 순서 관리는 관리자 영역입니다. 작업자 촬영 화면은 이 기준을 조회만 합니다.</p>
        </div>
      </header>
      <div className="reference-workspace">
        <form className="reference-form" onSubmit={submitReference}>
          <h2>관리자 등록 패널</h2>
          <label>
            관리 대상 제품
            <select value={selectedProductUuid} onChange={(event) => setSelectedProductUuid(event.target.value)}>
              {products.map((product) => (
                <option key={product.productUuid} value={product.productUuid}>
                  {product.code} {product.name ? `- ${product.name}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            검사 단계 순서
            <input min="1" step="1" type="number" value={stepOrder} onChange={(event) => setStepOrder(event.target.value)} />
          </label>
          <label>
            기준 사진명
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            비고
            <textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} />
          </label>
          <label>
            이미지 파일
            <input accept="image/*" type="file" onChange={(event) => setImageFile(event.target.files?.item(0) ?? null)} />
          </label>
          {selectedProduct ? (
            <p className="selection-summary">
              관리 대상: {selectedProduct.code}
              {selectedProduct.name ? ` · ${selectedProduct.name}` : ""}
            </p>
          ) : null}
          {submitError ? <p className="form-message form-message--error">{submitError}</p> : null}
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "등록 중" : "관리자 기준 사진 등록"}
          </button>
        </form>
        {references ? (
          <ReferenceShotList
            references={references}
            emptyLabel="이 제품에는 등록된 기준 사진이 없습니다."
            listLabel="관리자 기준 사진 편집 목록"
            contextLabel="관리자 기준"
          />
        ) : (
          <LoadingState label="기준 사진을 불러오는 중" />
        )}
      </div>
    </section>
  );
}
