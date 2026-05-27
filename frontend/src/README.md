# Frontend Source

## 역할

`frontend/src/`는 실행 가능한 React 앱 소스 루트다.

## 폴더 역할

| 경로 | 역할 | 갱신 기준 |
|---|---|---|
| `main.tsx` | React, Router, service provider를 조립하는 브라우저 진입점 | provider, router 종류, root render 방식이 바뀔 때 |
| `app/` | 앱 라우팅, service composition, DI context | 라우트, 주입 대상 service, 앱 초기화 정책이 바뀔 때 |
| `api/` | 프론트가 바라보는 API 계약과 HTTP/mock adapter | API 타입, mock fixture, adapter 정책이 바뀔 때 |
| `features/` | 업무 화면 단위 컴포넌트 | 화면 흐름, 라우트별 책임, 사용자 액션이 바뀔 때 |
| `shared/` | 화면 공통 컴포넌트, 카메라, guide 계산, 상태 표시 유틸 | 여러 feature가 공유하는 책임이 바뀔 때 |
| `styles.css` | CSS 파일 진입점 | CSS 파일 분리 구조가 바뀔 때 |
| `styles/` | base, layout, component, responsive CSS | 스타일 책임 경계가 바뀔 때 |
| `test/` | Vitest 테스트 환경 설정 | 테스트 환경과 전역 matcher가 바뀔 때 |

## 경계 기준

- 화면 컴포넌트는 mock fixture를 직접 import하지 않는다.
- API와 카메라 구현체는 `app`의 composition root를 통해 주입한다.
- 백엔드가 제공하지 않는 비즈니스 값을 화면에서 생성하지 않는다.
