# Frontend

## 역할

`frontend/`는 SANIL 프론트엔드 애플리케이션의 소유 경계다.

## 현재 상태

- React, Vite, TypeScript 기반 프론트엔드 MVP가 구성되어 있다.
- API 접근은 `src/api` 계층 뒤에 있으며, mock 데이터는 `src/api/mock/fixtures`에 분리되어 있다.
- 현재 GitHub Pages 배포 빌드는 `VITE_USE_MOCK_API=true`, `VITE_BASE_PATH=/SANIL/` 기준이다.
- HTTP adapter는 백엔드 계약 확정 전까지 명시적 오류를 반환하며, mock 데이터를 대신 생성하지 않는다.

## 폴더 역할

| 경로 | 역할 | 갱신 기준 |
|---|---|---|
| `index.html` | Vite 앱 진입 HTML | root element, 기본 메타가 바뀔 때 |
| `package.json` | 프론트엔드 실행, 검증, 빌드 스크립트와 의존성 | 스크립트/의존성/패키지 매니저가 바뀔 때 |
| `pnpm-lock.yaml` | 의존성 잠금 파일 | 의존성 설치 결과가 바뀔 때 |
| `pnpm-workspace.yaml` | pnpm 빌드 승인 정책 | 패키지 빌드 스크립트 승인 정책이 바뀔 때 |
| `vite.config.ts` | Vite, Vitest, dev/preview 서버 설정 | base path, plugin, test 환경이 바뀔 때 |
| `eslint.config.js` | ESLint 규칙 | 린트 기준이 바뀔 때 |
| `tsconfig*.json` | TypeScript 빌드/앱/노드 설정 | 타입 검사 범위가 바뀔 때 |
| `src/` | 실행 소스 루트 | 앱 구조, API 경계, 화면 흐름이 바뀔 때 |
| `public/mock-images/` | mock fixture가 참조하는 정적 이미지 | mock 이미지 계약이 바뀔 때 |
| `docs/` | 프론트엔드 화면 흐름, 상태, mock 경계 문서 | 화면/API/mock/상태 모델이 바뀔 때 |

## 실행 명령

```powershell
corepack pnpm install
corepack pnpm run dev
corepack pnpm run lint
corepack pnpm run test:run
$env:VITE_BASE_PATH='/SANIL/'; $env:VITE_USE_MOCK_API='true'; corepack pnpm run build
```

## 구조 기준

- 화면, API 계약, 계산 책임, 데이터 출처, 저장된 사용자 결정은 서로 분리한다.
- API 접근은 원칙적으로 `src/api` 계층 뒤에 둔다.
- mock도 `src/api` 뒤의 대체 구현체로 관리한다.
- 테스트, Storybook, fixture는 직접 mock을 참조할 수 있는 예외 영역이다.
- 컴포넌트 책임이 생기면 컴포넌트 기준으로 폴더와 파일을 나눈다.
- API 계약, 인증/권한, DB 소유권은 `backend/`와 분리해 관리한다.
- 백엔드에서 제공하지 않는 비즈니스 값을 프론트에서 임의로 만들지 않는다.
- 명시적 지시가 없는 폴백 데이터는 만들지 않는다.
- service, API client, camera adapter는 composition root에서 생성해 React context로 주입한다.

## 문서 갱신 기준

- API 계약, mock 계약, 상태 관리 방식, 라우팅 경계가 바뀌면 관련 문서를 함께 갱신한다.
