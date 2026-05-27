# Result History State Detail

## 문서 목적

처리 대기, 최종 결과, 검사 이력, VLM finding 표시, status display의 화면 계약을 정의한다.

이 문서는 코드 구현 문서가 아니라 프론트 구현 시 따라야 할 책임 경계와 함수/컴포넌트 계약이다.

## 참조 기준

- `frontend/docs/frontend-design.md`
- `frontend/docs/api-contract.md`
- `frontend/docs/vlm-result-contract.md`
- `frontend/docs/photo-qa-ui.md`
- `docs/project/photo-qa-workflow.md`
- `backend/docs/database/tables/INSPECTED.md`

## 적용 범위

- 포함:
  - 전체 촬영 완료 후 처리 대기 화면
  - 최종 결과 화면
  - 검사 이력 화면
  - VLM finding 목록과 이미지 overlay 표시
  - `InspectionStatus` 표시 문구, 색상 의미, 사용 가능 액션
- 제외:
  - 카메라 촬영 화면 구현
  - 기준 사진 guide shape 편집
  - HTTP adapter, mock adapter의 구체 구현
  - VLM 호출 백엔드 구현

## 핵심 원칙

- 최종 합부 결과는 모든 필수 촬영이 끝난 뒤에만 표시한다.
- 개별 촬영 직후에는 `ComparisonStatus`만 표시하고 개별 합격/불합격은 노출하지 않는다.
- `FAILED`는 처리 실패이며 불합격이 아니다.
- 불합격은 `REJECTED`로만 표시한다.
- 실패, 빈 결과, 필수값 누락, API 오류는 `PASSED`나 `REJECTED`로 보정하지 않는다.
- VLM 호출 실패는 VLM 출력 상태가 아니며 시스템 처리 실패 상태로 표시한다.
- finding 좌표는 항상 `origin: "top_left"`, `unit: "ratio"` 계약을 따른다.

## 상태 의미

### InspectionStatus

| 값 | 표시명 | 의미 | 결과 화면 처리 | 금지 사항 |
|---|---|---|---|---|
| `PASSED` | 합격 | 모든 필수 개소가 기준 대비 명확한 이상 없음 | 최종 합격 결과와 근거 표시 | 일부 항목 실패를 숨기고 합격 처리 금지 |
| `PROCESSING` | 처리 중 | 촬영은 진행 중이거나 비교/집계가 끝나지 않음 | 처리 대기 화면으로 안내 | 최종 합부 문구 표시 금지 |
| `FAILED` | 처리 실패 | 이미지 접근, VLM 호출, 파싱, 저장, 집계 등 시스템 처리 실패 | 실패 원인과 재시도/확인 필요 상태 표시 | 불합격으로 표시 금지 |
| `NEEDS_REVIEW` | 검토 필요 | 모델 확신 부족, 촬영 품질 문제, 사람이 확인해야 하는 결과 | 검토 필요 결과와 항목별 근거 표시 | 합격이나 불합격으로 자동 보정 금지 |
| `REJECTED` | 불합격 | 명확한 누락, 오조립, 손상, 외관 이상 발견 | 불합격 결과와 NG finding 표시 | 시스템 실패를 불합격으로 치환 금지 |
| `SKIPPED` | 제외됨 | 검사 대상에서 제외된 항목 또는 세션 | 제외 사유가 있으면 표시 | 정상 합부 결과로 집계 금지 |
| `DISCARDED` | 폐기됨 | 사용자가 검사 세션 또는 결과를 폐기 | 이력에는 폐기 상태로 표시 | 재사용 가능한 정상 결과처럼 표시 금지 |

### ComparisonStatus

| 값 | 표시명 | 의미 | 표시 위치 |
|---|---|---|---|
| `NOT_STARTED` | 대기 전 | 아직 비교 작업이 생성되지 않음 | 처리 대기, 촬영 단계 상태 |
| `QUEUED` | 처리 대기 | 비교 작업이 큐에 들어감 | 처리 대기 화면 |
| `PROCESSING` | 비교 중 | VLM/LLM 비교 실행 중 | 처리 대기 화면 |
| `PROCESSED` | 비교 완료 | 개별 비교 결과 저장 완료 | 처리 대기 화면의 진행률 |
| `FAILED` | 비교 실패 | 개별 비교 작업 실패 | 처리 대기 화면의 실패 항목 |

`ComparisonStatus.FAILED`도 불합격이 아니다. 개별 비교 실패는 세션 최종 상태가 `FAILED` 또는 `NEEDS_REVIEW`가 될 수 있지만, `REJECTED`로 직접 치환하지 않는다.

## 처리 대기 화면

### 화면 책임

`inspection-processing`은 모든 필수 촬영이 완료된 뒤 최종 결과가 준비될 때까지의 진행 상태를 보여준다.

### 입력

- `inspectionSessionUuid`
- `InspectionSession`
- 촬영 단계별 `ComparisonStatus`
- API loading/error 상태

### 출력

- 전체 진행률: `PROCESSED` 항목 수 / 전체 필수 촬영 수
- 대기, 처리 중, 실패 항목 수
- 최종 결과 진입 가능 여부
- API 실패 또는 데이터 누락 상태

### 부작용

- 주기적 재조회 또는 사용자의 새로고침 액션을 통해 API를 다시 호출할 수 있다.
- API 호출은 반드시 `src/api` 계층 뒤에서 수행한다.

### 실패 처리

- API 요청 실패는 빈 목록으로 대체하지 않는다.
- 단계별 비교 상태를 받지 못하면 진행률을 임의 계산하지 않고 "상태 확인 불가"로 표시한다.
- 일부 항목이 `FAILED`이면 실패 항목을 숨기지 않는다.
- 전체 촬영이 끝나지 않았으면 결과 화면 진입 액션을 비활성화하고 누락 단계 수를 표시한다.

### 금지 사항

- 개별 촬영 결과의 합격/불합격 노출 금지
- `ComparisonStatus.FAILED`를 불합격으로 표시 금지
- `totalSteps`, `capturedSteps`를 화면에서 임의 생성 금지
- 처리 실패 항목을 진행률 계산에서 조용히 제외 금지

## 최종 결과 화면

### 화면 책임

`inspection-result`는 검사 세션 단위의 최종 상태와 개소별 비교 근거를 함께 표시한다.

### 입력

- `inspectionSessionUuid`
- `InspectionResultSummary`
- API loading/error 상태

### 출력

- 세션 최종 상태 badge
- 완료 일시 또는 미완료/실패 상태
- 개소별 결과 목록
- 기준 이미지와 QA 대상 이미지 비교 영역
- finding 목록과 overlay
- 빈 결과 또는 계약 불일치 경고

### 표시 조건

- 모든 필수 촬영이 완료된 뒤에만 최종 합부 문구를 표시한다.
- `InspectionResultSummary.status`가 `PROCESSING`이면 최종 결과 대신 처리 대기 상태를 표시한다.
- `items.length === 0`이면 빈 결과 상태를 명시하고 합격/불합격을 표시하지 않는다.
- `completedAt === null`이면 완료 일시를 비워 두지 말고 "완료 시각 없음" 또는 상태별 안내를 표시한다.

### 실패 처리

- `FAILED`는 처리 실패 카드와 원인 확인 안내로 표시한다.
- item 단위 `findings`가 빈 배열이면 "표시 가능한 finding 없음"으로 표시한다.
- 필수 이미지가 누락되면 이미지 영역을 감추지 않고 누락 상태 placeholder를 표시한다.
- API 실패는 `ApiError.kind` 기준으로 auth, permission, validation, not_found, conflict, server, network를 구분해 보여준다.

### 금지 사항

- 실패를 `PASSED` 또는 `REJECTED`로 변환 금지
- 빈 `items`를 정상 합격으로 간주 금지
- reference image 누락 시 inspected image만으로 정상 비교처럼 표시 금지
- `confidence`만으로 합격/불합격 변경 금지

## 검사 이력 화면

### 화면 책임

`inspection-history`는 완료, 실패, 검토 필요, 폐기된 검사 세션의 이력을 조회하고 상세 결과로 이동하게 한다.

### 입력

- 이력 조회 조건:
  - 제품 식별자 또는 제품 검색어
  - 검사 상태 필터
  - 기간
  - 촬영자 또는 로그인 사용자
  - 페이지네이션 조건
- 이력 항목 목록
- API loading/error 상태

### 출력

- 검사 세션 목록
- 제품 코드/제품명
- 검사 차수
- 촬영자
- 최종 상태
- 촬영 단계 수
- 생성/수정/완료 시각
- 결과 상세 진입 링크

### API 계약 공백

현재 구현 기준 `frontend/docs/api-contract.md`와 `src/api/contracts.ts`에는 이력 목록 조회 함수가 있다.

MVP 계약은 결과 상세 진입에 필요한 최소 필드만 포함한다.

```ts
export interface InspectionHistoryItem {
  inspectionSessionUuid: Uuid;
  productCode: string;
  productName: string | null;
  status: InspectionStatus;
  round: number;
  capturedSteps: number;
  totalSteps: number;
  updatedAt: IsoDateTimeString;
}
```

촬영자, 완료 시각, 검색 조건, 페이지네이션은 후속 백엔드 계약에서 확정한다. 화면은 해당 값이 필요해지기 전까지 임의로 표시값을 만들지 않는다.

### 실패 처리

- 조회 실패는 빈 이력으로 대체하지 않는다.
- 권한 오류는 빈 목록이 아니라 권한 부족 상태로 표시한다.
- 이력 항목에 상태가 없으면 "상태 확인 불가"로 표시하고 결과 badge를 만들지 않는다.
- 촬영자 정보가 누락되면 임의 사용자명을 만들지 않고 "촬영자 정보 없음"으로 표시한다.

### 금지 사항

- 컴포넌트가 mock fixture를 직접 import 금지
- 이력 count, 촬영자, 완료 시각을 화면에서 임의 생성 금지
- `DISCARDED`를 삭제된 데이터처럼 숨김 처리 금지

## VLM Finding 표시

### 데이터 계약

화면은 API가 제공한 `InspectionFinding[]`만 표시한다.

```ts
export interface InspectionFinding {
  coordinate: RatioBox & {
    origin: "top_left";
    unit: "ratio";
  };
  detail: {
    criteria: string;
    observation: string;
    reason: string;
  };
  judge: "OK" | "NG" | "NEEDS_REVIEW";
  confidence: number | null;
}
```

### 표시 책임

- `judge: "OK"`는 정상 근거로 표시한다.
- `judge: "NG"`는 불일치 또는 이상 근거로 표시한다.
- `judge: "NEEDS_REVIEW"`는 사람 확인이 필요한 근거로 표시한다.
- `confidence`는 보조 정보이며 단독 판정 기준으로 쓰지 않는다.
- `criteria`, `observation`, `reason`은 원문 의미를 보존해 표시한다.

### 좌표 표시

- `coordinate.origin`은 반드시 `top_left`여야 한다.
- `coordinate.unit`은 반드시 `ratio`여야 한다.
- `x`, `y`, `w`, `h`는 0 이상 1 이하의 비율값이어야 한다.
- 이미지 렌더링 크기와 무관하게 ratio를 표시 영역 크기에 곱해 overlay를 그린다.
- 좌표가 잘못된 finding은 목록 텍스트는 표시하되 overlay만 "좌표 표시 불가"로 처리한다.

### 실패 처리

- finding 배열이 없거나 null이면 API 계약 오류로 표시한다.
- finding 배열이 비어 있으면 "표시 가능한 finding 없음"으로 표시한다.
- 좌표 계약이 틀리면 finding 자체를 삭제하거나 숨기지 않는다.
- 이미지 로딩 실패 시 finding 목록은 계속 표시한다.

### 금지 사항

- 픽셀 좌표를 ratio 좌표처럼 해석 금지
- 좌표 누락 finding을 정상 finding처럼 overlay 금지
- VLM 원문을 컴포넌트에서 임의 파싱해 finding 생성 금지
- `FAILED` 상태에서 finding이 없다는 이유로 불합격 항목 생성 금지

## Status Display 계약

### `mapInspectionStatusToDisplay`

```ts
export interface InspectionStatusDisplay {
  label: string;
  tone: "success" | "info" | "warning" | "danger" | "neutral";
  resultKind: "passed" | "processing" | "failed" | "needs_review" | "rejected" | "skipped" | "discarded";
  allowsFinalJudgementText: boolean;
}

export function mapInspectionStatusToDisplay(
  status: InspectionStatus,
): InspectionStatusDisplay;
```

입력:

- `InspectionStatus`

출력:

- 화면 표시 label
- badge tone
- 결과 의미를 나타내는 `resultKind`
- 최종 합부 문구 표시 가능 여부

부작용:

- 없음

실패:

- 정의되지 않은 status는 타입 레벨에서 막는다.
- 런타임에서 알 수 없는 status를 받으면 호출부는 "상태 확인 불가" 오류 상태를 표시해야 한다.

금지:

- `FAILED`를 `rejected`로 매핑 금지
- `PROCESSING`에 최종 합부 문구 허용 금지
- 알 수 없는 status를 `PASSED`로 fallback 금지

### `InspectionStatusBadge`

입력:

- `status: InspectionStatus`
- `size?: "sm" | "md"`
- `showDescription?: boolean`

출력:

- 상태 label과 tone을 가진 badge UI
- 필요한 경우 짧은 설명 문구

부작용:

- 없음

실패:

- status display mapping 실패 시 badge 대신 "상태 확인 불가"를 표시한다.

금지:

- badge 내부에서 API 호출 금지
- badge 내부에서 status 값 변환 금지
- 색상만으로 상태 의미 전달 금지

### `ResultFindingList`

입력:

- `findings: InspectionFinding[]`
- `selectedFindingId?: string`
- `onSelectFinding?: (findingIndex: number) => void`

출력:

- judge별 finding 목록
- criteria, observation, reason
- confidence 보조 표시
- 좌표 표시 가능 여부

부작용:

- 사용자가 finding을 선택하면 선택 이벤트만 발생시킨다.
- API 호출, 상태 저장, 결과 보정은 하지 않는다.

실패:

- findings가 비어 있으면 빈 상태를 표시한다.
- 필수 detail 필드가 누락되면 해당 finding을 계약 오류로 표시한다.

금지:

- 목록 컴포넌트에서 VLM 원문 파싱 금지
- confidence 기준으로 judge 변경 금지
- 잘못된 좌표 finding 삭제 금지

### `InspectionHistoryPage`

입력:

- URL query 또는 화면 상태의 이력 조회 조건
- `src/api` 계층이 반환한 이력 목록

출력:

- 필터 가능한 검사 이력 목록
- 각 이력의 status badge
- 결과 상세 페이지 이동 액션

부작용:

- 조회 조건 변경 시 API 재조회
- 상세 이동 시 route 변경

실패:

- API 오류는 종류별 오류 상태로 표시한다.
- 빈 결과는 "조회된 검사 이력 없음"으로 표시한다.
- 권한 오류는 빈 결과로 숨기지 않는다.

금지:

- mock 또는 HTTP client 직접 호출 금지
- 이력 항목의 누락 필드를 임의 보정 금지
- `DISCARDED`, `FAILED` 항목을 기본 필터에서 숨기고 전체 이력을 왜곡 금지

## 결과 화면 데이터 흐름

```text
Route inspectionSessionUuid
  -> src/api.getInspectionResult(inspectionSessionUuid)
  -> InspectionResultSummary
  -> mapInspectionStatusToDisplay(summary.status)
  -> Result page view model
  -> InspectionStatusBadge
  -> ResultFindingList + image overlay
```

화면은 `InspectionResultSummary`를 직접 수정하지 않는다. 표시 편의를 위한 view model은 원본 값을 보존하고, 누락/오류 상태만 별도 flag로 분리한다.

## 이력 화면 데이터 흐름

```text
History screen mount
  -> src/api.listInspectionHistory()
  -> InspectionHistoryItem[]
  -> status display mapping
  -> InspectionHistoryPage table/list
  -> result detail route
```

현재 구현은 query 없는 `listInspectionHistory()`를 사용한다. 필터, 기간, 페이지네이션이 필요해지면 API 계약과 mock fixture를 먼저 확장한다.

## 검증 기준

- `FAILED` badge label은 "처리 실패"이며 "불합격"이 아니다.
- `REJECTED`만 "불합격"으로 표시한다.
- `PROCESSING` 상태에서는 최종 합부 문구가 보이지 않는다.
- 빈 `items`나 빈 `findings`는 숨기지 않고 빈 상태로 표시한다.
- API 실패는 빈 배열 fallback으로 처리하지 않는다.
- finding overlay는 ratio 좌표만 사용한다.
- 알 수 없는 status는 정상 상태로 fallback하지 않는다.

## 남은 이슈

- `frontend/docs/api-contract.md`에 검사 이력 목록 조회 함수가 아직 없다.
- `INSPECTED.result`의 DB 저장 형식이 단일 finding 객체인지 배열인지 확정되지 않았다.
- 촬영자 로그인 정보가 이력 API에 어떤 필드명으로 노출될지 확정이 필요하다.
- 실패 상세 원인 코드가 아직 API 계약에 없으므로 `FAILED` 원인 표시 수준은 후속 계약에서 정해야 한다.
