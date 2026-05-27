# Shared Frontend Modules

## 역할

`frontend/src/shared/`는 여러 feature가 함께 쓰는 UI와 순수 계산 모듈을 둔다.

## 폴더 역할

| 경로 | 역할 | 갱신 기준 |
|---|---|---|
| `components/` | 상태, layout, guide overlay 등 공통 UI | 공통 UI 계약이나 스타일 클래스가 바뀔 때 |
| `camera/` | 카메라 촬영 adapter contract와 mock 구현 | 실제 장비/브라우저 카메라 연동 방식이 바뀔 때 |
| `imaging/` | guide shape ratio 좌표 계산 | guide 좌표 계약이나 렌더링 계산이 바뀔 때 |
| `status/` | 검사 상태 표시 label/tone mapping | 상태 enum 또는 표시 정책이 바뀔 때 |

## 경계 기준

- shared 모듈은 특정 feature의 라우트나 화면 상태를 직접 알지 않는다.
- 순수 계산 모듈은 DOM, API client, fixture에 의존하지 않는다.
- 장치 구현은 adapter contract 뒤에 둔다.
