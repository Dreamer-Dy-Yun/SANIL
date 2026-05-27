# Database Open Issues

## 구현 전 확정 필요

| 항목 | 현재 원본 설계 상태 | 필요한 결정 |
|---|---|---|
| ERD 링크 | `ERD` 시트에는 "하기 링크 참조"만 있고 export된 xlsx에는 실제 링크가 없다. | 실제 ERD 원본 링크 또는 다이어그램 파일을 확보해야 한다. |
| `uuid` nullable | 대부분 `uuid`가 `unique=True`, `nullable=True`, `default=gen_random_uuid()`로 적혀 있다. | 외부 참조용 식별자라면 `NOT NULL` 여부를 명확히 해야 한다. |
| 감사 일시 기본값 | `db_created_at`, `db_updated_at`은 타입/포맷만 있고 기본값이 비어 있다. | `DEFAULT now()`와 update trigger 사용 여부를 정해야 한다. |
| `DEPARTMENT.parent_uuid` | 상급부서 UUID로 설명되지만 FK가 비어 있다. | `DEPARTMENT.uuid` self-FK 여부와 삭제 정책을 정해야 한다. |
| `COMPOSITE` 제약 | 여러 필드가 `COMPOSITE`로 표시되어 있으나 constraint 이름과 null 처리 방식이 없다. | 복합 unique/index 정의를 마이그레이션에서 명시해야 한다. |
| 권한/상태 enum | `authority`, `PROMPT.role`, `INSPECTED.status`가 문자열 값 목록으로 설명되어 있다. | DB enum, check constraint, 애플리케이션 enum 중 기준을 정해야 한다. |
| 이미지 파일 수명주기 | `IMAGE.path_file`, `path_thumb`가 파일 경로만 가진다. | 파일 저장 root, 삭제 책임, 썸네일 재생성 정책을 정해야 한다. |
| LLM API 키 저장 | `LLM.key` 주석은 DB 별도 암호화를 하지 않는 방향을 적고 있다. | 운영 전 secret 관리/암호화/접근권한 정책을 다시 검토해야 한다. |
| Google credential 저장 | `GOOGLE_API.json_credential`이 JSONB로 credential 전체를 저장한다. | credential 암호화, 마스킹, 접근 감사 정책을 정해야 한다. |
| 사용자 데이터 격리 | `메모` 시트는 동적 테이블 생성/제거가 바람직하지만 ORM 사용을 우선한다고 적고 있다. | tenant/user data isolation 전략을 API/DB 계약으로 확정해야 한다. |
| `LLM_USAGE.uuid` 주석 | 원본 설계서에서 `uuid` 행의 Comment가 `USER_ACCOUNT.uuid 값`으로 되어 있다. | 단순 복사 오류인지, 별도 의미가 있는지 확인해야 한다. |
| `INSPECTION_SESSION` | 최신 원본 설계에서 검사 묶음용 별도 테이블이 추가되었다. | `INSPECTION_SESSION.round`와 `INSPECTED.round`의 의미, 세션 상태 집계 규칙, API 명칭(`inspectionSessionUuid`)을 구현 전에 고정해야 한다. |

## 구현 시 주의

- 원본 설계가 `uuid` 기반 FK를 사용하므로 API 응답에서도 내부 `id`와 외부 `uuid` 노출 기준을 분리해야 한다.
- `PRODUCT` 삭제는 `REFERENCE`, `INSPECTED`, `IMAGE`의 파일/레코드 삭제 순서와 트랜잭션 경계를 먼저 설계해야 한다.
- `LLM_USAGE`는 스냅샷 로그이므로 FK 정합성을 강제하지 않는 대신 변경 당시 값을 정확히 기록해야 한다.
- `USER_ACCOUNT.hash_password`는 해시 알고리즘, salt/pepper, 실패 횟수 초기화 정책을 별도 인증 계약으로 문서화해야 한다.
