import { Camera, Check, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFrontendServices } from "../../app/serviceContext";
import { ErrorState } from "../../shared/components/ErrorState";
import { GuideOverlay } from "../../shared/components/GuideOverlay";
import { LoadingState } from "../../shared/components/LoadingState";
import type { CapturedImage } from "../../shared/camera/cameraAdapter";
import type { InspectionCaptureStep, InspectionSession } from "../../api/contracts";

export function CapturePage() {
  const { inspectionSessionUuid = "", stepOrder = "1" } = useParams();
  const stepNumber = Number(stepOrder);
  const { apiClient, cameraAdapter } = useFrontendServices();
  const navigate = useNavigate();
  const [session, setSession] = useState<InspectionSession | null>(null);
  const [step, setStep] = useState<InspectionCaptureStep | null>(null);
  const [captured, setCaptured] = useState<CapturedImage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.getInspectionSession(inspectionSessionUuid),
      apiClient.getInspectionCaptureStep(inspectionSessionUuid, stepNumber),
    ])
      .then(([nextSession, nextStep]) => {
        setSession(nextSession);
        setStep(nextStep);
      })
      .catch(setError);

    return () => cameraAdapter.dispose();
  }, [apiClient, cameraAdapter, inspectionSessionUuid, stepNumber]);

  const nextTarget = useMemo(() => {
    if (!session) return null;
    return stepNumber >= session.totalSteps
      ? `/inspections/${inspectionSessionUuid}/processing`
      : `/inspections/${inspectionSessionUuid}/capture/${stepNumber + 1}`;
  }, [inspectionSessionUuid, session, stepNumber]);

  const capture = async () => {
    setError(null);
    setCaptured(await cameraAdapter.captureFrame());
  };

  const confirm = async () => {
    if (!step || !captured) return;
    setIsConfirming(true);
    setError(null);
    try {
      await apiClient.confirmInspectionCapture({
        inspectionSessionUuid,
        referenceUuid: step.reference.referenceUuid,
        stepOrder: step.reference.stepOrder,
        imageFile: captured.file,
        capturedAt: new Date().toISOString(),
      });
      if (nextTarget) navigate(nextTarget);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setIsConfirming(false);
    }
  };

  if (error) return <ErrorState error={error} />;
  if (!session || !step) return <LoadingState label="촬영 단계를 준비하는 중" />;

  return (
    <section className="capture-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Inspection Capture</span>
          <h1>{step.reference.name}</h1>
        </div>
        <span className="step-pill">
          {stepNumber} / {session.totalSteps}
        </span>
      </header>

      <div className="capture-grid">
        <section className="capture-preview">
          <img
            src={captured?.previewUrl ?? step.reference.image?.imageUrl}
            alt={captured ? "촬영 미리보기" : "기준 사진"}
          />
          <GuideOverlay guideShape={step.reference.guideShape} />
        </section>

        <aside className="capture-side">
          <div className="reference-thumb reference-thumb--side">
            {step.reference.image ? <img src={step.reference.image.imageUrl} alt={step.reference.name} /> : null}
            <GuideOverlay guideShape={step.reference.guideShape} />
          </div>
          <div>
            <h2>촬영 지시</h2>
            <p>{step.reference.remarks}</p>
          </div>
          <div className="capture-actions">
            <button type="button" onClick={() => void capture()} className="secondary-button">
              {captured ? <RotateCcw size={18} /> : <Camera size={18} />}
              {captured ? "재촬영" : "촬영"}
            </button>
            <button type="button" onClick={() => void confirm()} className="primary-button" disabled={!captured || isConfirming}>
              <Check size={18} />
              {isConfirming ? "확정 중" : "촬영 확정"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
