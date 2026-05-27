# Shared Components

## 역할

`shared/components/`는 특정 업무 도메인에 종속되지 않는 공통 화면 부품을 둔다.

## 파일 역할

| 파일 | 역할 | 변경 기준 |
|---|---|---|
| `PageShell.tsx` | 로그인 후 공통 앱 프레임, route outlet, desktop sidebar, tablet drawer navigation | 전역 내비게이션 또는 shell layout이 바뀔 때 |
| `ErrorState.tsx` | API/화면 오류 표시 | 공통 오류 표시 계약이 바뀔 때 |
| `LoadingState.tsx` | 로딩 상태 표시 | 공통 로딩 문구/스타일이 바뀔 때 |
| `GuideOverlay.tsx` | ratio guide shape overlay 렌더링 | guide shape 계약이 바뀔 때 |
| `StatusBadge.tsx` | 검사 상태 tone badge | 상태 표시 정책이 바뀔 때 |

## 경계 기준

- 공통 컴포넌트는 API adapter, mock fixture, feature route 내부 상태를 직접 알지 않는다.
- `PageShell`은 navigation 표시와 drawer 열림 상태만 소유하고 업무 데이터를 생성하지 않는다.
