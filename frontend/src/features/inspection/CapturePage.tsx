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
    try {
      setCaptured(await cameraAdapter.captureFrame());
    } catch (nextError) {
      setError(nextError);
    }
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

  const previewUrl = captured?.previewUrl ?? step.reference.image?.imageUrl ?? null;
  const captureStateLabel = captured ? "촬영 이미지 확인 중" : "촬영 대기";
  const captureStateDetail = captured
    ? "확정하면 다음 촬영 단계로 이동합니다."
    : "기준 위치와 동일한 구도로 맞춘 뒤 촬영합니다.";

  return (
    <section className="capture-page" aria-label="검사 촬영">
      <section className="capture-stage" aria-live="polite">
        <div className="capture-instruction-bar">
          <div>
            <span className="eyebrow">촬영 {stepNumber} / {session.totalSteps}</span>
            <strong>{step.reference.name}</strong>
          </div>
          <span>{step.reference.remarks ?? "지정된 기준 위치에 맞춰 촬영합니다."}</span>
        </div>

        {previewUrl ? (
          <img className="capture-stage__image" src={previewUrl} alt={captured ? "촬영 미리보기" : "기준 사진"} />
        ) : (
          <div className="capture-empty">기준 사진 없음</div>
        )}
        <GuideOverlay guideShape={step.reference.guideShape} />

        <div className="capture-action-bar">
          <div className="capture-state">
            <strong>{captureStateLabel}</strong>
            <span>{captureStateDetail}</span>
          </div>
          <div className="capture-action-buttons">
            <button type="button" onClick={() => void capture()} className="secondary-button">
              {captured ? <RotateCcw size={20} /> : <Camera size={20} />}
              {captured ? "재촬영" : "촬영"}
            </button>
            <button
              type="button"
              onClick={() => void confirm()}
              className="primary-button"
              disabled={!captured || isConfirming}
            >
              <Check size={20} />
              {isConfirming ? "확정 중" : "촬영 확정"}
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
