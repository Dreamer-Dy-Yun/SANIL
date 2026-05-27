# LLM_USAGE

## 문서 기준

- 원본 시트: `(Table)LLM_USAGE`
- 원본 문서: [https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)
- DBMS: Postgre SQL
- 데이터베이스: MainDB(가칭)
- 버전: 0.0.0
- 테이블 목적: LLM 사용 관리(LOG)
- 특기사항: LOG 이므로, 타 테이블을 참조하지 않고 고정된 값을 가짐

## 테이블 책임

- `LLM_USAGE`: LLM 사용 관리(LOG). 원본 설계서의 책임을 가진다.
- 구현 시 라우터/서비스/DB 접근 계층은 이 테이블 책임을 기준으로 분리한다.

## 필드 정의

| 필드 | 타입 | 기본키 | Unique | Foreign Key | Nullable | Default | 설명 | Comment |
|---|---|---|---|---|---|---|---|---|
| `id` | BIGINT | PK | - | - | False | GENERATED ALWAYS AS IDENTITY | 인덱스 | BIG INT |
| `llm_name` | VARCHAR(100) | - | - | - | - | - | LLM 이름 | LLM.name 값 |
| `llm_provider` | VARCHAR(100) | - | - | - | - | - | LLM 제공업체 | LLM.provider 값 |
| `llm_model` | VARCHAR(100) | - | - | - | - | - | LLM 모델 | LLM.model 값 |
| `user_account_name` | VARCHAR(100) | - | - | - | - | - | 사용자 이름 | USER_ACCOUNT.name 값 |
| `user_account_uuid` | UUID | - | - | - | - | - | 사용자 UUID | USER_ACCOUNT.uuid 값 |
| `endpoint` | TEXT | - | - | - | - | - | LLM 사용시의 호출 엔드포인트 | LLM 사용을 위한 호출 엔드포인트 |
| `input_tokens` | BIGINT | - | - | - | - | - | 입력 토큰 | 입력 사용 토큰 |
| `output_tokens` | BIGINT | - | - | - | - | - | 출력 토큰 | 출력 사용 토큰 |
| `total_tokens` | BIGINT | - | - | - | - | - | 총 토큰 | 총 사용 토큰 |
| `is_success` | BOOLEAN | - | - | - | - | - | 성공 여부 | - |
| `error_message` | TEXT | - | - | - | - | - | 에러 메시지 | - |
| `latency_ms` | BIGINT | - | - | - | - | - | 지연 시간(ms) | - |
| `cost_usd` | NUMERIC(20, 8) | - | - | - | - | - | 미화 기준 비용 | 비용 |
| `note` | TEXT | - | - | - | - | - | 비고 | 비고 |
| `uuid` | UUID | - | True | - | True | gen_random_uuid() | UUID | USER_ACCOUNT.uuid 값 |
| `db_created_by` | VARCHAR(100) | - | - | - | True | - | DB 업로드 사용자 | Database에 데이터를 입력한 사용자 |
| `db_updated_by` | VARCHAR(100) | - | - | - | True | - | DB 업데이트 사용자 | Database에 데이터가 변경한 사용자 |
| `db_created_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업로드 일시 | Database에 데이터가 입력된 시간 |
| `db_updated_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업데이트 일시 | Database에 데이터가 변경된 시간 |

## 제약/관계 메모

- 기본키: `id`
- Unique: `uuid`=True
- Foreign Key: -
- 공통 필드: `id`, `note`, `uuid`, `db_created_by`, `db_updated_by`, `db_created_at`, `db_updated_at`
