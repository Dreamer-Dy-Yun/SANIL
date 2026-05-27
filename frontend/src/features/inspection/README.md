# Inspection Feature

## 역할

`frontend/src/features/inspection/`은 검사 세션이 시작된 뒤의 촬영, 처리 대기, 최종 결과, 이력 화면을 책임진다.
기본 사용자는 현장 촬영 작업자이므로 화면은 1280 x 800급 태블릿에서 큰 터치 영역과 단일 작업 흐름을 우선한다.

## 파일 책임

| 파일 | 책임 | 변경 기준 |
|---|---|---|
| `CapturePage.tsx` | 한 기준 사진에 대한 QA 대상 촬영, 재촬영, 촬영 확정 | 촬영 단계 UI, 카메라 캡처, 확정 요청 흐름이 바뀔 때 |
| `ProcessingPage.tsx` | 모든 촬영 완료 뒤 결과 집계 대기와 최종 결과 이동 | 세션 처리 상태나 완료 이동 조건이 바뀔 때 |
| `ResultPage.tsx` | 최종 합부 결과와 항목별 근거 표시 | 결과 API 계약이나 표시 방식이 바뀔 때 |
| `HistoryPage.tsx` | 검사 이력 목록 조회와 최종 결과 상세 이동 | 이력 API 계약이나 필터/정렬 요구가 바뀔 때 |

## 경계

- API와 mock 데이터는 직접 만들지 않고 `src/api` 계층 뒤의 `SanilApiClient`를 사용한다.
- 카메라 캡처는 `CameraAdapter`를 주입받아 사용하고 브라우저 API를 화면에서 직접 호출하지 않는다.
- 촬영 화면은 하나의 촬영 개소만 다루며, 최종 합부 판정은 결과 화면 책임으로 둔다.
- 촬영 지시는 촬영 영역 상단, 촬영/확정 액션은 촬영 영역 하단에 둔다.
- M86XE 1차 화면에서는 우측 기준 썸네일 패널을 두지 않는다.
- 처리 화면은 비교 데이터 수신과 다음 이동만 보여주며 최종 합격/불합격 배지를 표시하지 않는다.
- 결과 화면과 이력 화면은 API가 반환한 최종 상태를 `StatusBadge`로 표시한다.

## 이벤트 흐름

1. `CapturePage.tsx`는 세션과 촬영 단계를 조회한 뒤 `CameraAdapter.captureFrame()`으로 촬영본을 받는다.
2. 촬영 확정 시 `confirmInspectionCapture()`를 호출하고 다음 단계 또는 processing route로 이동한다.
3. `ProcessingPage.tsx`는 세션과 결과 요약을 조회하지만 최종 판정은 노출하지 않고 결과 화면 이동만 제공한다.
4. `ResultPage.tsx`는 결과 요약과 기준 사진 가이드를 조회해 최종 판정과 finding 근거를 표시한다.
5. `HistoryPage.tsx`는 검사 이력 API만 사용하고 상세 이동은 각 세션의 result route로 연결한다.
