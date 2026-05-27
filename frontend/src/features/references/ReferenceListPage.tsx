import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { toApiError } from "../../api/errors";
import { ErrorState } from "../../shared/components/ErrorState";
import { GuideOverlay } from "../../shared/components/GuideOverlay";
import { LoadingState } from "../../shared/components/LoadingState";
import type { ReferenceShot } from "../../api/contracts";

const getNextStepOrder = (references: ReferenceShot[]) =>
  references.reduce((maxOrder, reference) => Math.max(maxOrder, reference.stepOrder), 0) + 1;

export function ReferenceListPage() {
  const { productUuid = "" } = useParams();
  const { apiClient } = useFrontendServices();
  const [references, setReferences] = useState<ReferenceShot[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [stepOrder, setStepOrder] = useState("1");
  const [remarks, setRemarks] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadReferences = useCallback(async () => {
    const nextReferences = await apiClient.listReferenceShots(productUuid);
    setReferences(nextReferences);
    setStepOrder(String(getNextStepOrder(nextReferences)));
  }, [apiClient, productUuid]);

  useEffect(() => {
    loadReferences().catch(setError);
  }, [loadReferences]);

  const submitReference = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!imageFile) {
      setSubmitError("기준 사진 파일을 선택해야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      const nextReference = await apiClient.createReferenceShot({
        productUuid,
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
      <div className="reference-workspace">
        <form className="reference-form" onSubmit={submitReference}>
          <h2>기준 사진 등록</h2>
          <label>
            촬영 순서
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
            <input
              accept="image/*"
              type="file"
              onChange={(event) => setImageFile(event.target.files?.item(0) ?? null)}
            />
          </label>
          {submitError ? <p className="form-message form-message--error">{submitError}</p> : null}
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "등록 중" : "기준 사진 등록"}
          </button>
        </form>
        <div className="reference-list">
          {references.map((reference) => (
            <article className="reference-row" key={reference.referenceUuid}>
              <div className="reference-thumb">
                {reference.image ? <img src={reference.image.imageUrl} alt={reference.name} /> : null}
                <GuideOverlay guideShape={reference.guideShape} />
              </div>
              <div>
                <span className="step-pill">STEP {reference.stepOrder}</span>
                <h2>{reference.name}</h2>
                <p>{reference.remarks}</p>
                <small>{reference.guideShape ? "ratio guide shape 등록됨" : "guide shape 없음"}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
