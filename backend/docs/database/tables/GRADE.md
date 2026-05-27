# GRADE

## 문서 기준

- 원본 시트: `(Table)GRADE`
- 원본 문서: [https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)
- DBMS: Postgre SQL
- 데이터베이스: MainDB(가칭)
- 버전: 0.0.0
- 테이블 목적: 직급 관리
- 특기사항: -

## 테이블 책임

- `GRADE`: 직급 관리. 원본 설계서의 책임을 가진다.
- 구현 시 라우터/서비스/DB 접근 계층은 이 테이블 책임을 기준으로 분리한다.

## 필드 정의

| 필드 | 타입 | 기본키 | Unique | Foreign Key | Nullable | Default | 설명 | Comment |
|---|---|---|---|---|---|---|---|---|
| `id` | BIGINT | PK | - | - | False | GENERATED ALWAYS AS IDENTITY | 인덱스 | BIG INT, 상황에 따라 UUID도 고려 |
| `name` | TEXT | - | True | - | - | - | 직급명 | - |
| `sort_order` | NUMERIC | - | - | - | - | - | 직급 순서 | 직급 표시 및 우선순위 정렬에 사용하는 값.<br>값이 작을수록 상위 직급으로 간주한다.<br>중간 직급 추가 가능성을 고려하여 초기값은 일정 간격을 두고 부여한다. |
| `note` | TEXT | - | - | - | - | - | 비고 | 직급 관련 비고 |
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

- `name`: 사원(S-Rank)
- `sort_order`: 100
- `note`: 최고레벨 사원. 진급 최우선순위
