# VLM Result Contract

## 목적

VLM/LLM 응답은 자유 문장이 아니라 구조화된 결과로 저장하고 표시한다.

## 입력

VLM 비교 작업은 최소한 다음 입력을 가진다.

```ts
export interface VlmComparisonInput {
  productCode: string;
  productName: string | null;
  referenceName: string;
  referenceRemarks: string | null;
  referenceImageUrl: string;
  inspectedImageUrl: string;
  systemPrompt: string;
  userPrompt: string;
}
```

## 출력

```ts
export interface VlmComparisonOutput {
  status: "passed" | "rejected" | "needs_review";
  summary: string;
  differences: string[];
  evidence: string[];
  confidence: number;
  requiredHumanReview: boolean;
}
```

VLM 호출 자체가 실패한 경우에는 위 출력으로 변환하지 않고 시스템 상태 `failed`로 저장한다.

## 판정 규칙

| 상태 | 의미 |
|---|---|
| `passed` | 기준 사진 대비 명확한 이상이 없음 |
| `rejected` | 누락, 오조립, 손상, 외관 이상 등 명확한 차이가 있음 |
| `needs_review` | 모델 확신이 낮거나 촬영 품질/가림/조명 문제로 사람이 확인해야 함 |
| `failed` | 모델 호출, 이미지 접근, 계약 파싱 실패. VLM 출력 상태가 아님 |

## 프롬프트 원칙

- 도면 치수/공차 보증을 요구하지 않는다.
- 기준 사진과 QA 대상 사진의 외관/형상/누락/오조립/손상 차이를 비교한다.
- 확신이 낮으면 `needs_review`를 반환하게 한다.
- 불확실한 차이를 합격으로 처리하지 않는다.
- 결과에는 사람이 확인할 수 있는 근거를 포함한다.

## 표시 원칙

- `summary`는 최종 결과 카드의 짧은 설명에 사용한다.
- `differences`는 개소별 차이 목록으로 표시한다.
- `evidence`는 모델이 판단에 사용한 시각적 근거로 표시한다.
- `confidence`는 내부 판단 보조용이며 단독 합격 기준으로 사용하지 않는다.
