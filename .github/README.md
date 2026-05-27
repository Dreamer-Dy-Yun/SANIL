# GitHub Automation

## 역할

`.github/`는 SANIL 저장소의 GitHub Actions와 Pages 배포 자동화 경계다.

## 폴더 역할

| 경로 | 역할 | 갱신 기준 |
|---|---|---|
| `workflows/deploy-frontend.yml` | `main` push 또는 수동 실행 시 `frontend/`를 검증하고 GitHub Pages로 배포 | 배포 브랜치, Node/pnpm 버전, 빌드 env, Pages 권한이 바뀔 때 |

## 배포 기준

- 배포 빌드는 `frontend/`에서 실행한다.
- 현재 Pages base path는 `/SANIL/`이다.
- 현재 배포 모드는 `VITE_USE_MOCK_API=true`다.
- SPA fallback을 위해 `dist/index.html`을 `dist/404.html`로 복사한다.
- `dist/` 산출물은 Git에 커밋하지 않는다.

## 검증 기준

- `pnpm install --frozen-lockfile`
- `pnpm run lint`
- `pnpm run test:run`
- `pnpm run build`
