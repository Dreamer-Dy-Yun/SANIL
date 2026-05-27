# Database Table Index

## 출처

- 원본 문서: [https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156](https://docs.google.com/spreadsheets/d/1ZPNDdweVtMZ0YzDE9pxIICEuxYJ_lHD6/edit?gid=1504994156#gid=1504994156)

## 테이블 목록

| Table | 테이블 목적 | 필드 수 | 외래키 수 | Document |
|---|---|---:|---:|---|
| `DEPARTMENT` | 부서관리 | 11 | 0 | [DEPARTMENT.md](DEPARTMENT.md) |
| `GRADE` | 직급 관리 | 10 | 0 | [GRADE.md](GRADE.md) |
| `POSITION` | 직책 관리 | 10 | 0 | [POSITION.md](POSITION.md) |
| `USER_ACCOUNT` | 계정 관리 | 18 | 2 | [USER_ACCOUNT.md](USER_ACCOUNT.md) |
| `USER_POSITION_ASSIGNMENT` | 사용자-직책 관리 | 8 | 2 | [USER_POSITION_ASSIGNMENT.md](USER_POSITION_ASSIGNMENT.md) |
| `PROMPT` | 공통 프롬프트 등록/관리 | 13 | 0 | [PROMPT.md](PROMPT.md) |
| `PRODUCT` | 제품 정보 관리 | 11 | 0 | [PRODUCT.md](PRODUCT.md) |
| `REFERENCE` | 대조군 사진 및 정보 | 12 | 2 | [REFERENCE.md](REFERENCE.md) |
| `INSPECTED` | 대상 이미지 검사 이력 및 판정 결과 관리 | 15 | 3 | [INSPECTED.md](INSPECTED.md) |
| `IMAGE` | 저장 이미지 메타데이터 관리 | 13 | 0 | [IMAGE.md](IMAGE.md) |
| `LLM` | LLM API 관리 | 13 | 0 | [LLM.md](LLM.md) |
| `LLM_USAGE` | LLM 사용 관리(LOG) | 20 | 0 | [LLM_USAGE.md](LLM_USAGE.md) |
| `GOOGLE_API` | GOOGLE_API 관리 | 11 | 0 | [GOOGLE_API.md](GOOGLE_API.md) |

## 공통 필드

- 대부분의 업무 테이블은 `id`, `uuid`, `db_created_by`, `db_updated_by`, `db_created_at`, `db_updated_at` 계열의 식별/감사 필드를 갖는다.
- 구현 시 `id`는 내부 PK, `uuid`는 외부 참조용 식별자로 구분해서 사용한다.
