# USER_ACCOUNT

## 문서 기준

- 원본 시트: `(Table)USER_ACCOUNT`
- 원본 문서: [https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)
- DBMS: Postgre SQL
- 데이터베이스: MainDB(가칭)
- 버전: 0.0.0
- 테이블 목적: 계정 관리
- 특기사항: -

## 테이블 책임

- `USER_ACCOUNT`: 계정 관리. 원본 설계서의 책임을 가진다.
- 구현 시 라우터/서비스/DB 접근 계층은 이 테이블 책임을 기준으로 분리한다.
- 외래키 삭제 정책은 아래 필드 정의의 `Foreign Key` 값을 기준으로 한다.

## 필드 정의

| 필드 | 타입 | 기본키 | Unique | Foreign Key | Nullable | Default | 설명 | Comment |
|---|---|---|---|---|---|---|---|---|
| `id` | BIGINT | PK | - | - | False | GENERATED ALWAYS AS IDENTITY | 인덱스 | BIG INT, 상황에 따라 UUID도 고려 |
| `login_id` | VARCHAR(100) | - | True | - | - | - | 로그인 아이디 | 변경 가능. 중복만 제한. |
| `hash_password` | VARCHAR(255) | - | - | - | - | - | 해싱된 패스워드 | - |
| `department_uuid` | UUID | - | - | DEPARTMENT.uuid ON DELETE SET NULL | - | - | 부서 UUID | 부서가 사라진다고 사람이 사라지면 안됨 |
| `grade_uuid` | UUID | - | - | GRADE.uuid ON DELETE SET NULL | - | - | 직급 UUID | 직급이 사라진다고 사람이 사라지면 안됨 |
| `name` | VARCHAR(100) | - | - | - | - | - | 이름 | 이름 |
| `email` | VARCHAR(200) | - | - | - | - | - | 이메일 | 비밀번호 제공 등을 위한 이메일 |
| `contact` | VARCHAR(100) | - | - | - | - | - | 연락처 | 기본적으로 한국 전화번호 포멧 사용.<br>다국적일 경우, 국가번호와 그에따른 전화번호 포멧을 정리한 테이블 고려 가능 |
| `authority` | VARCHAR(20) | - | - | - | - | - | 시스템 권한 | 권한. 시스템이 커지고 페이지별 권한등이 필요하게 되면 권한 코드로 변경하고,<br>권한 테이블 별도 생성 할 것 |
| `note` | TEXT | - | - | - | - | - | 비고 | 직책 등 메모 |
| `failed_login_count` | INTEGER | - | - | - | - | - | 로그인 실패 횟수 | 5회 실패시 락. |
| `must_change_password` | BOOLEAN | - | - | - | - | - | 비밀번호 필수 변경 | - |
| `is_active` | BOOLEAN | - | - | - | - | True | 활성화 여부 | 계정 활성화 여부 |
| `uuid` | UUID | - | True | - | True | gen_random_uuid() | UUID | - |
| `db_created_by` | VARCHAR(100) | - | - | - | True | - | DB 업로드 사용자 | Database에 데이터를 입력한 사용자 |
| `db_updated_by` | VARCHAR(100) | - | - | - | True | - | DB 업데이트 사용자 | Database에 데이터가 변경한 사용자 |
| `db_created_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업로드 일시 | Database에 데이터가 입력된 시간 |
| `db_updated_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업데이트 일시 | Database에 데이터가 변경된 시간 |

## 제약/관계 메모

- 기본키: `id`
- Unique: `login_id`=True, `uuid`=True
- Foreign Key: `department_uuid` -> DEPARTMENT.uuid ON DELETE SET NULL, `grade_uuid` -> GRADE.uuid ON DELETE SET NULL
- 공통 필드: `id`, `note`, `is_active`, `uuid`, `db_created_by`, `db_updated_by`, `db_created_at`, `db_updated_at`
