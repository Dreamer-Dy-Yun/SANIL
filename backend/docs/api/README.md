# Backend API Design

## 현재 상태

백엔드 구현은 아직 보류 상태다.

이 문서는 프론트 설계와 DB 설계 사이의 API 경계 초안이다.

## 원칙

- API는 프론트가 필요한 데이터를 명시적으로 제공한다.
- 프론트가 백엔드 미제공 값을 생성하지 않도록 계약을 먼저 고정한다.
- 실패는 성공 응답으로 숨기지 않는다.
- 인증 실패와 권한 부족은 구분한다.
- 라우터, 서비스, repository, 외부 adapter는 의존성 주입으로 연결한다.
- DB connection, storage client, VLM provider, queue client를 전역 singleton으로 두지 않는다.
- 앱 생성 함수에서 의존성을 조립하고 각 기능에 주입한다.

## 백엔드 계층 분리

| 계층 | 책임 |
|---|---|
| Router | HTTP 요청/응답, 인증/권한 guard, request validation |
| Service | 업무 규칙, 상태 전이, 트랜잭션 경계 |
| Repository | DB 읽기/쓰기 |
| Adapter | image storage, VLM provider, queue, credential provider |
| Factory | 환경별 repository/adapter/service 생성 |

Service는 구체 DB driver나 외부 SDK를 직접 생성하지 않는다.

## 주요 리소스

| 리소스 | 책임 | 관련 DB |
|---|---|---|
| `auth` | 로그인, 현재 사용자 | `USER_ACCOUNT` |
| `products` | 제품 목록/상세 | `PRODUCT` |
| `references` | 제품별 기준 사진 | `REFERENCE`, `IMAGE` |
| `inspection-sessions` | 전체 QA 검사 묶음 | `INSPECTION_SESSION` |
| `inspection-captures` | 기준 사진별 QA 대상 촬영 | `INSPECTED`, `IMAGE` |
| `inspection-results` | 최종 집계 결과 | `INSPECTED`, `LLM_USAGE` |

## 엔드포인트 초안

| Method | Path | 목적 |
|---|---|---|
| `POST` | `/auth/login` | 로그인 |
| `GET` | `/auth/me` | 현재 사용자 |
| `GET` | `/products` | 제품 목록 |
| `GET` | `/products/{productUuid}/references` | 제품별 기준 사진 목록 |
| `POST` | `/products/{productUuid}/references` | 기준 사진 등록 |
| `POST` | `/inspection-sessions` | 검사 세션 생성 |
| `GET` | `/inspection-sessions/{inspectionSessionUuid}` | 검사 세션 상태 |
| `GET` | `/inspection-sessions/{inspectionSessionUuid}/steps/{stepOrder}` | 촬영 단계 조회 |
| `POST` | `/inspection-sessions/{inspectionSessionUuid}/captures` | QA 대상 사진 확정 |
| `GET` | `/inspection-sessions/{inspectionSessionUuid}/result` | 최종 결과 조회 |

## DB 매핑

최신 DB 설계에는 `INSPECTION_SESSION` 테이블이 있다.

- API의 `inspectionSessionUuid`는 `INSPECTION_SESSION.uuid`에 매핑한다.
- `INSPECTED.inspection_session_uuid`는 개별 촬영 결과를 검사 세션에 연결한다.
- 세션 시작/완료 시각, 촬영자, 전체 상태는 우선 `INSPECTED` 레코드 묶음과 `db_created_*` 감사 필드에서 집계한다.
- 세션 단위 메타데이터가 늘어나면 별도 세션 테이블을 후속 마이그레이션으로 검토한다.

남은 결정은 `session` 생성 주체, nullable/default 정책, 복합 unique constraint 이름이다.
