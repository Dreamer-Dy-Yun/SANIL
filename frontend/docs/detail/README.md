# Frontend Detail Docs

## 역할

`frontend/docs/detail/`은 프론트엔드 기능별 상세 설계 계약을 모아 두는 폴더다.

이 폴더의 문서는 구현자가 따라야 할 책임 경계, 입력/출력, 실패 상태, 금지 경계를 정리한 기준 문서로 사용한다.

## 문서 목록

| 경로 | 책임 |
|---|---|
| [foundation-and-api-detail.md](foundation-and-api-detail.md) | composition root, dependency injection, `SanilApiClient`, HTTP/mock adapter, `ApiError`, fixture 경계를 정의한다. |
| [reference-and-guide-detail.md](reference-and-guide-detail.md) | 기준 사진 등록/목록/순서, guide shape 표시/편집, ratio 좌표 검증과 overlay 렌더링 경계를 정의한다. |
| [inspection-capture-detail.md](inspection-capture-detail.md) | 검사 세션 생성, 단계형 촬영, `CameraAdapter`, capture state machine, 촬영 확정 API 경계를 정의한다. |
| [result-history-state-detail.md](result-history-state-detail.md) | 처리 대기, 최종 결과, 검사 이력, VLM finding 표시, status display 계약을 정의한다. |

## 경계 기준

- 상세 설계 문서는 화면, API 계약, mock, 상태 모델, 장치 제어 책임이 섞이지 않도록 기능별 기준을 분리한다.
- 본문 문서의 계약을 바꾸는 경우 상위 `frontend/docs/README.md`와 관련 설계 문서를 함께 갱신한다.
- 코드 구현, mock fixture 작성, API adapter 구현은 이 폴더의 책임이 아니다.
- 백엔드 미확정 계약은 프론트에서 임의 확정하지 않고 상세 설계 문서의 미확정 항목이나 후속 todo로 남긴다.

## 사용 순서

1. 전체 화면 흐름은 `../frontend-design.md`에서 확인한다.
2. 구현 대상 기능에 맞는 상세 설계 문서를 확인한다.
3. API 또는 mock 경계를 다룰 때는 `foundation-and-api-detail.md`를 함께 확인한다.
4. 기능 책임이나 계약이 바뀌면 이 README와 상위 문서 목록의 링크를 갱신한다.
