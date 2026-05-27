# IMAGE

## 문서 기준

- 원본 시트: `(Table)IMAGE`
- 원본 문서: [https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)
- DBMS: Postgre SQL
- 데이터베이스: MainDB(가칭)
- 버전: 0.0.0
- 테이블 목적: 저장 이미지 메타데이터 관리
- 특기사항: -

## 테이블 책임

- `IMAGE`: 저장 이미지 메타데이터 관리. 원본 설계서의 책임을 가진다.
- 구현 시 라우터/서비스/DB 접근 계층은 이 테이블 책임을 기준으로 분리한다.

## 필드 정의

| 필드 | 타입 | 기본키 | Unique | Foreign Key | Nullable | Default | 설명 | Comment |
|---|---|---|---|---|---|---|---|---|
| `id` | BIGINT | PK | - | - | False | GENERATED ALWAYS AS IDENTITY | 인덱스 | BIG INT, 상황에 따라 UUID도 고려 |
| `filename_original` | TEXT | - | - | - | - | - | 원본 파일명 | 업로드시 원본 파일명 |
| `hash_file` | VARCHAR(64) | - | - | - | - | - | 파일 해시 | 원본 파일 해시 |
| `path_file` | TEXT | - | - | - | - | - | 파일 경로 | 저장 이미지 파일 경로. 해시 등을 섞어 파일명 생성. <br>충돌 우려가 있으므로 원본 파일명은 사용하지 말 것. |
| `path_thumb` | TEXT | - | - | - | - | - | 썸네일 경로 | 저장 이미지 파일 경로. 해시 등을 섞어 파일명 생성. <br>충돌 우려가 있으므로 원본 파일명은 사용하지 말 것. |
| `mime_type` | VARCHAR(100) | - | - | - | - | - | MIME 타입 | image/jpeg, image/png 등 |
| `width` | INTEGER | - | - | - | - | - | 너비 | - |
| `height` | INTEGER | - | - | - | - | - | 높이 | - |
| `uuid` | UUID | - | True | - | True | gen_random_uuid() | UUID | - |
| `db_created_by` | VARCHAR(100) | - | - | - | True | - | DB 업로드 사용자 | Database에 데이터를 입력한 사용자 |
| `db_updated_by` | VARCHAR(100) | - | - | - | True | - | DB 업데이트 사용자 | Database에 데이터가 변경한 사용자 |
| `db_created_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업로드 일시 | Database에 데이터가 입력된 시간 |
| `db_updated_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업데이트 일시 | Database에 데이터가 변경된 시간 |

## 제약/관계 메모

- 기본키: `id`
- Unique: `uuid`=True
- Foreign Key: -
- 공통 필드: `id`, `uuid`, `db_created_by`, `db_updated_by`, `db_created_at`, `db_updated_at`

## Examples

- `path_file`: /XXXXX/YYYY.jpg
- `path_thumb`: /XXXXX/(TN)YYYY.jpg
