# LLM

## 문서 기준

- 원본 시트: `(Table)LLM`
- 원본 문서: [https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)
- DBMS: Postgre SQL
- 데이터베이스: MainDB(가칭)
- 버전: 0.0.0
- 테이블 목적: LLM API 관리
- 특기사항: -

## 테이블 책임

- `LLM`: LLM API 관리. 원본 설계서의 책임을 가진다.
- 구현 시 라우터/서비스/DB 접근 계층은 이 테이블 책임을 기준으로 분리한다.

## 필드 정의

| 필드 | 타입 | 기본키 | Unique | Foreign Key | Nullable | Default | 설명 | Comment |
|---|---|---|---|---|---|---|---|---|
| `id` | BIGINT | PK | - | - | False | GENERATED ALWAYS AS IDENTITY | 인덱스 | BIG INT, 상황에 따라 UUID도 고려 |
| `name` | VARCHAR(100) | - | True | - | - | - | 이름 | API 키 이름 |
| `provider` | VARCHAR(100) | - | - | - | - | - | 제공업체 | LLM 서비스 제공 업체 |
| `model` | VARCHAR(100) | - | - | - | - | - | 이름 | 사용할 모델명 |
| `key` | TEXT | - | - | - | - | - | API 키 | API 키.<br>관리자는 어차피 정보 접근 할 수 있는 상황이므로 DB에서는 별도 암호화 하지 않음<br>DB정보 탈취시 문제 발생가능 하나 이 경우는 재발급 받는 것으로.<br>또한 동일 API KEY로 복수 용도 사용가능하니, 유니크 설정하지 않을 것 |
| `purpose` | TEXT | - | - | - | - | - | LLM 사용 목적 | 사용 목적 |
| `note` | TEXT | - | - | - | - | - | 비고 | 비고 |
| `is_active` | BOOLEAN | - | - | - | - | True | 활성화 여부 | 계정 활성화 여부 |
| `uuid` | UUID | - | True | - | True | gen_random_uuid() | UUID | - |
| `db_created_by` | VARCHAR(100) | - | - | - | True | - | DB 업로드 사용자 | Database에 데이터를 입력한 사용자 |
| `db_updated_by` | VARCHAR(100) | - | - | - | True | - | DB 업데이트 사용자 | Database에 데이터가 변경한 사용자 |
| `db_created_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업로드 일시 | Database에 데이터가 입력된 시간 |
| `db_updated_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업데이트 일시 | Database에 데이터가 변경된 시간 |

## 제약/관계 메모

- 기본키: `id`
- Unique: `name`=True, `uuid`=True
- Foreign Key: -
- 공통 필드: `id`, `note`, `is_active`, `uuid`, `db_created_by`, `db_updated_by`, `db_created_at`, `db_updated_at`

## Examples

- `provider`: OPEN AI
- `model`: gpt-5.5
