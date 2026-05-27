# REFERENCE

## 문서 기준

- 원본 시트: `(Table)REFERENCE`
- 원본 문서: [https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)
- DBMS: Postgre SQL
- 데이터베이스: MainDB(가칭)
- 버전: 0.0.0
- 테이블 목적: 대조군 사진 및 정보
- 특기사항: -

## 테이블 책임

- `REFERENCE`: 대조군 사진 및 정보. 원본 설계서의 책임을 가진다.
- 구현 시 라우터/서비스/DB 접근 계층은 이 테이블 책임을 기준으로 분리한다.
- 외래키 삭제 정책은 아래 필드 정의의 `Foreign Key` 값을 기준으로 한다.

## 필드 정의

| 필드 | 타입 | 기본키 | Unique | Foreign Key | Nullable | Default | 설명 | Comment |
|---|---|---|---|---|---|---|---|---|
| `id` | BIGINT | PK | - | - | False | GENERATED ALWAYS AS IDENTITY | 인덱스 | BIG INT, 상황에 따라 UUID도 고려 |
| `product_uuid` | UUID | - | COMPOSITE | PRODUCT.uuid ON DELETE RESTRICT | False | - | PRODUCT.UUID | 이 레코드가 존재시 이 레코드가 참조하는 PRODUCT의 삭제 금지<br><br>1. 실제 이미지 파일 삭제 <br>→ 2. IMAGE 테이블 레코드 삭제 <br>→ 3. 이 테이블 레코드 삭제 (삭제 필요시)<br>→ 4. PRODUCT 테이블 레코드 삭제 <br><br>를 강제 |
| `name` | VARCHAR(100) | - | - | - | - | - | 이미지 이름 | 이미지 이름 |
| `image_uuid` | UUID | - | - | IMAGE.UUID ON DELETE SET NULL | - | - | 이미지 UUID | IMAGE 테이블의 레코드를 삭제하더라도 이 레코드는 삭제하지 않음 |
| `step_order` | NUMERIC | - | COMPOSITE | - | - | - | 순서 | 사진 촬영 유도 순서 |
| `remarks` | TEXT | - | - | - | - | - | 특기사항 | 유저 프롬프트에 추가로 들어가게 될 내용.<br>기본 공통 프롬프트 이외에, 해당 사진 내에서 중점적으로 확인해야 할 내용을 기술 |
| `note` | TEXT | - | - | - | - | - | 비고 | 비고 |
| `uuid` | UUID | - | True | - | True | gen_random_uuid() | UUID | - |
| `db_created_by` | VARCHAR(100) | - | - | - | True | - | DB 업로드 사용자 | Database에 데이터를 입력한 사용자 |
| `db_updated_by` | VARCHAR(100) | - | - | - | True | - | DB 업데이트 사용자 | Database에 데이터가 변경한 사용자 |
| `db_created_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업로드 일시 | Database에 데이터가 입력된 시간 |
| `db_updated_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업데이트 일시 | Database에 데이터가 변경된 시간 |

## 제약/관계 메모

- 기본키: `id`
- Unique: `product_uuid`=COMPOSITE, `step_order`=COMPOSITE, `uuid`=True
- Foreign Key: `product_uuid` -> PRODUCT.uuid ON DELETE RESTRICT, `image_uuid` -> IMAGE.UUID ON DELETE SET NULL
- 공통 필드: `id`, `note`, `uuid`, `db_created_by`, `db_updated_by`, `db_created_at`, `db_updated_at`

## Examples

- `name`: XXXXX 상단
