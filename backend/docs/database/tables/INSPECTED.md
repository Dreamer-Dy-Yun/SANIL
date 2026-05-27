# INSPECTED

## 문서 기준

- 원본 시트: `(Table)INSPECTED`
- 원본 문서: [https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)
- DBMS: Postgre SQL
- 데이터베이스: MainDB(가칭)
- 버전: 0.0.0
- 테이블 목적: 대상 이미지 검사 이력 및 판정 결과 관리
- 특기사항: -

## 테이블 책임

- `INSPECTED`: 대상 이미지 검사 이력 및 판정 결과 관리. 원본 설계서의 책임을 가진다.
- 구현 시 라우터/서비스/DB 접근 계층은 이 테이블 책임을 기준으로 분리한다.
- `session` 필드는 여러 촬영 결과를 하나의 검사 묶음으로 연결한다.
- 외래키 삭제 정책은 아래 필드 정의의 `Foreign Key` 값을 기준으로 한다.

## 필드 정의

| 필드 | 타입 | 기본키 | Unique | Foreign Key | Nullable | Default | 설명 | Comment |
|---|---|---|---|---|---|---|---|---|
| `id` | BIGINT | PK | - | - | False | GENERATED ALWAYS AS IDENTITY | 인덱스 | BIG INT, 상황에 따라 UUID도 고려 |
| `session` | UUID | - | COMPOSITE | - | - | - | 세션 | 검사 묶음 |
| `product_uuid` | UUID | - | COMPOSITE | PRODUCT.uuid ON DELETE RESTRICT | False | - | PRODUCT.UUID | 이 레코드가 존재시 이 레코드가 참조하는 PRODUCT의 삭제 금지<br><br>1. 실제 이미지 파일 삭제 <br>→ 2. IMAGE 테이블 레코드 삭제 <br>→ 3. 이 테이블 레코드 삭제 (CASCADE)<br>→ 4. PRODUCT 테이블 레코드 삭제 <br><br>를 강제 |
| `reference_uuid` | UUID | - | COMPOSITE | REFERENCE.UUID ON DELETE SET NULL | - | - | 대조군 UUID | - |
| `image_uuid` | UUID | - | - | IMAGE.UUID ON DELETE CASCADE | - | - | 이미지 UUID | IMAGE 테이블의 레코드 삭제시 함께 삭제 |
| `prompt_system` | TEXT | - | - | - | - | - | 시스템 프롬프트 | 평가에 사용된 시스템 프롬프트(스냅샷) |
| `prompt_user` | TEXT | - | - | - | - | - | 유저 프롬프트 | 평가에 사용된 유저 프롬프트(스냅샷)<br>PRODUCT.remarks + REFERENCE.remarks |
| `round` | NUMERIC | - | COMPOSITE | - | - | - | 검사 차수 | 복수 검사 가능 하므로, 검사차수 도입 |
| `status` | VARCHAR(20) | - | - | - | - | - | 상태 | 검사 상태/결과 |
| `note` | TEXT | - | - | - | - | - | 비고 | 비고 |
| `uuid` | UUID | - | True | - | True | gen_random_uuid() | UUID | - |
| `db_created_by` | VARCHAR(100) | - | - | - | True | - | DB 업로드 사용자 | Database에 데이터를 입력한 사용자 |
| `db_updated_by` | VARCHAR(100) | - | - | - | True | - | DB 업데이트 사용자 | Database에 데이터가 변경한 사용자 |
| `db_created_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업로드 일시 | Database에 데이터가 입력된 시간 |
| `db_updated_at` | TIMESTAMPTZ | - | - | - | True | - | DB 업데이트 일시 | Database에 데이터가 변경된 시간 |

## 제약/관계 메모

- 기본키: `id`
- Unique: `session`=COMPOSITE, `product_uuid`=COMPOSITE, `reference_uuid`=COMPOSITE, `round`=COMPOSITE, `uuid`=True
- Foreign Key: `product_uuid` -> PRODUCT.uuid ON DELETE RESTRICT, `reference_uuid` -> REFERENCE.UUID ON DELETE SET NULL, `image_uuid` -> IMAGE.UUID ON DELETE CASCADE
- 공통 필드: `id`, `note`, `uuid`, `db_created_by`, `db_updated_by`, `db_created_at`, `db_updated_at`

## Examples

- `round`: 3
