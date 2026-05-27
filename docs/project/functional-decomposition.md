# Functional Decomposition

## 목적

SANIL은 기능 단위로 설계하고 구현한다.

기능 단위는 화면 단위와 같지 않다. 하나의 기능은 책임, 입력, 출력, 저장 데이터, 실패 상태가 명확한 작업 단위다.

## 기능 목록

| 기능 | 책임 | 주요 입력 | 주요 출력 | 관련 문서/DB |
|---|---|---|---|---|
| Auth | 사용자 로그인, 현재 사용자, 권한 확인 | login id, password | current user, auth error | `USER_ACCOUNT` |
| Product Catalog | QA 대상 제품 목록/선택 | product filter | product summary | `PRODUCT` |
| Reference Registration | 제품별 기준 사진 등록 | product, image, step order, remarks | reference shot | `REFERENCE`, `IMAGE` |
| Reference Guide | 기준 사진 기반 촬영 가이드 관리 | reference image, guide shape | overlay/guide shape | `REFERENCE`, `IMAGE` |
| Inspection Session | 한 번의 QA 검사 묶음 생성/관리 | product, user | session, steps | `INSPECTION_SESSION` |
| Capture Step | 기준 사진 하나에 대응하는 QA 대상 촬영 | session, reference, image | inspected image, queued comparison | `INSPECTED`, `IMAGE` |
| Comparison Job | VLM/LLM 비교 작업 예약/실행 | reference image, inspected image, prompts | structured comparison | `INSPECTED`, `LLM_USAGE` |
| Result Aggregation | 개별 비교 결과를 최종 검사 결과로 집계 | session, comparison items | final status, review items | `INSPECTED` |
| Inspection History | 검사 이력 조회 | user/product/date filters | session summaries | `INSPECTED`, session |
| Admin Config | 사용자, LLM, Google API 설정 관리 | admin input | config records | `USER_ACCOUNT`, `LLM`, `GOOGLE_API` |

## 기능별 경계

### Auth

- 사용자 인증과 현재 사용자 정보만 책임진다.
- 제품, 검사, 촬영 상태를 알지 않는다.
- 401과 403은 구분한다.

### Product Catalog

- 제품 목록과 제품 선택만 책임진다.
- 기준 사진 개수는 API가 제공한 값을 사용한다.
- 기준 사진 목록을 직접 조합하지 않는다.

### Reference Registration

- 기준 사진은 하나씩 등록한다.
- 촬영 순서, 기준 사진명, 주의사항, guide shape를 관리한다.
- QA 대상 촬영 결과를 생성하지 않는다.

### Reference Guide

- 기준 사진에서 촬영 오버레이에 필요한 shape만 관리한다.
- 1차 구현에서는 수동/반자동 guide shape를 허용한다.
- VLM 판정 결과를 알지 않는다.

### Inspection Session

- 제품 하나에 대한 전체 QA 촬영 묶음을 책임진다.
- 최신 DB 설계의 `INSPECTION_SESSION.uuid`를 검사 묶음 식별자로 사용한다.
- API에서는 `inspectionSessionUuid`로 노출한다.
- 개별 촬영 결과를 직접 판정하지 않는다.

### Capture Step

- 한 기준 사진에 대응하는 QA 대상 사진 하나를 촬영/확정한다.
- 촬영 확정 후 비교 작업을 큐에 넣는다.
- 개별 결과를 최종 사용자 판정으로 표시하지 않는다.

### Comparison Job

- VLM/LLM 호출과 구조화된 결과 파싱을 책임진다.
- 모델 호출 실패는 `failed`로 기록하고 합격/불합격으로 변환하지 않는다.
- prompt와 provider 선택은 주입받는다.

### Result Aggregation

- 모든 촬영 단계가 끝난 뒤 최종 결과를 집계한다.
- `failed` 또는 `needs_review`가 있으면 사용자 확인이 필요한 상태로 드러낸다.
- 없는 데이터를 만들어 최종 상태를 산출하지 않는다.

### Inspection History

- 과거 검사 세션과 결과 요약 조회를 책임진다.
- 검사 결과를 재계산하지 않는다.

### Admin Config

- 사용자, LLM, Google API 설정을 관리한다.
- secret/credential 표시와 저장 정책은 백엔드 보안 계약을 따른다.

## 병렬 구현 기준

병렬 작업은 파일 수정 권한이 분리될 때만 허용한다.

- Auth와 Product Catalog는 병렬 가능
- Reference Registration과 Capture Step은 guide shape 계약이 확정된 뒤 병렬 가능
- API contract와 mock fixture는 같은 파일을 공유하므로 하나의 todo에서 처리
- Result Aggregation은 Inspection Session 계약이 확정된 뒤 진행

## 기능 README 기준

각 기능 폴더는 구현 시 `README.md`를 가진다.

필수 항목:

- 기능 책임
- 공개 컴포넌트/함수/클래스
- 입력 계약
- 출력 계약
- 의존성
- 실패 상태
- 수정 가능 범위
