# Frontend Docs

## 역할

`frontend/docs/`는 프론트엔드 구현과 유지보수에 필요한 화면 흐름, API 경계, mock 경계, 상태 모델을 기록한다.

## 문서 목록

| 경로 | 역할 |
|---|---|
| `frontend-design.md` | 프론트엔드 전체 설계, 화면 흐름, 상태, 장비 기준 |
| `photo-qa-ui.md` | 사진 기반 QA 화면 흐름과 상태 기준 |
| `mock-boundary.md` | 프론트 단독 설계 시 mock 데이터 분리 기준 |
| `app-architecture.md` | 프론트 기능 경계와 권장 폴더 구조 |
| `capture-screen-design.md` | 단계형 촬영 화면 설계 |
| `api-contract.md` | 프론트가 바라보는 API 계약 초안 |
| `vlm-result-contract.md` | VLM/LLM 구조화 결과 계약 |
| [`detail/README.md`](detail/README.md) | 프론트 상세 설계 문서 폴더 역할과 문서별 책임 |
| [`detail/foundation-and-api-detail.md`](detail/foundation-and-api-detail.md) | foundation, API client, HTTP/mock adapter, 오류 계약 상세 설계 |
| [`detail/reference-and-guide-detail.md`](detail/reference-and-guide-detail.md) | 기준 사진과 guide shape 표시/편집 상세 설계 |
| [`detail/inspection-capture-detail.md`](detail/inspection-capture-detail.md) | 검사 세션, 단계형 촬영, 카메라 adapter 상세 설계 |
| [`detail/result-history-state-detail.md`](detail/result-history-state-detail.md) | 처리 대기, 최종 결과, 검사 이력, 상태 표시 상세 설계 |
| `../../docs/project/functional-decomposition.md` | 프로젝트 기능 단위 분해 |
| `../../docs/project/dependency-injection-and-patterns.md` | DI와 패턴 사용 기준 |

## 갱신 기준

- 화면 흐름, API 계약, 상태 모델, mock 구조가 바뀌면 관련 문서를 갱신한다.
- 프론트가 백엔드 미제공 값을 임의 생성해야 하는 상황이 생기면 구현하지 말고 계약 이슈로 기록한다.
