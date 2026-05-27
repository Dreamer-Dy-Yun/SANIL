# Database Design

## 출처

- 원본 문서: [(산일전기)DB 설계(ver.0.0.0)](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)
- 프로젝트명: `(Database)산일전기-QA 자동 판정 시스템(1)`
- 결과물: `(Database)산일전기`
- DBMS: `PostgreSQL`
- 데이터베이스: `MainDB(가칭)`
- 설계 버전: `0.0.0`
- 작성자/갱신자: `윤대영`
- 표지 작성일: `2026-05-22`
- 변경이력 갱신일: `2026-05-26`
- 로컬 문서화 반영일: `2026-05-27`

## 문서 범위

이 문서는 Google Sheets 설계서를 백엔드 구현 기준으로 옮긴 로컬 기준 문서다.

- [tables/README.md](tables/README.md): 테이블 목록과 테이블별 상세 문서
- [relationships.md](relationships.md): 외래키, 삭제 정책, 주요 데이터 흐름
- [open-issues.md](open-issues.md): 구현 전에 확정해야 할 스키마/운영 이슈

## 도메인 경계

| 영역 | 테이블 | 책임 |
|---|---|---|
| 조직/계정 | `DEPARTMENT`, `GRADE`, `POSITION`, `USER_ACCOUNT`, `USER_POSITION_ASSIGNMENT` | 부서, 직급, 직책, 사용자 계정, 사용자-직책 복수 배정 |
| 제품/검사 | `PRODUCT`, `REFERENCE`, `INSPECTED`, `IMAGE` | 제품 기준정보, 대조군 이미지, 검사 대상 이미지/판정 이력, 이미지 메타데이터 |
| LLM/프롬프트 | `PROMPT`, `LLM`, `LLM_USAGE` | 공통 프롬프트, LLM API 키/모델 설정, LLM 사용 로그 |
| 외부 연동 | `GOOGLE_API` | Google API credential과 사용 목적 관리 |

## 공통 모델 규칙

- 대부분의 테이블은 `id`를 내부 PK로 사용하고 `uuid`를 외부 참조용 식별자로 사용한다.
- 업무 테이블은 `db_created_by`, `db_updated_by`, `db_created_at`, `db_updated_at` 감사 필드를 반복해서 가진다.
- `is_active`가 있는 마스터/설정 테이블은 삭제보다 비활성화를 우선 고려한다.
- 외래키는 대체로 `uuid` 기반으로 연결된다.
- `LLM_USAGE`는 원본 설계서상 로그 테이블이며 다른 테이블을 FK로 참조하지 않고 스냅샷 값을 가진다.

## 명명 규칙

원본 `명명법` 시트 기준:

- 기본 포맷: `{상위}_{하위}`
- 외부 엔티티의 특정 필드를 참조할 때: `{entity}_{field}`
- 예: `department_uuid`는 `DEPARTMENT.uuid` 참조 값이다.
- 동일 테이블 내 같은 타입의 값이 여러 개일 때: `{type}_{role}`
- 예: `uuid_batch`, `uuid_record`, `uuid_group`

## 구현 기준

- API 계약과 DB 스키마는 `backend/` 책임이다.
- 프론트가 필요한 값은 프론트에서 임의 생성하지 않고 API/DB 계약으로 먼저 정의한다.
- 라우터, 서비스/비즈니스 로직, DB 접근 책임은 테이블 책임과 API 계약을 기준으로 분리한다.
- 원본 설계서와 다르게 구현해야 하는 경우 [open-issues.md](open-issues.md)에 근거를 남긴 뒤 진행한다.
