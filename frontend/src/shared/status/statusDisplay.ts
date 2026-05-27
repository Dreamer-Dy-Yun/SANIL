import type { InspectionStatus } from "../../api/contracts";

export interface InspectionStatusDisplay {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral" | "progress";
  description: string;
}

export function mapInspectionStatusToDisplay(status: InspectionStatus): InspectionStatusDisplay {
  switch (status) {
    case "PASSED":
      return { label: "합격", tone: "success", description: "필수 기준 대비 주요 이상 없음" };
    case "PROCESSING":
      return { label: "처리 중", tone: "progress", description: "촬영 또는 비교 처리가 진행 중" };
    case "FAILED":
      return { label: "처리 실패", tone: "danger", description: "시스템 처리 실패이며 불합격이 아님" };
    case "NEEDS_REVIEW":
      return { label: "검토 필요", tone: "warning", description: "사람 확인이 필요한 결과" };
    case "REJECTED":
      return { label: "불합격", tone: "danger", description: "명확한 누락 또는 이상 발견" };
    case "SKIPPED":
      return { label: "제외됨", tone: "neutral", description: "검사 대상에서 제외된 항목" };
    case "DISCARDED":
      return { label: "폐기됨", tone: "neutral", description: "폐기 처리된 검사" };
  }
}
