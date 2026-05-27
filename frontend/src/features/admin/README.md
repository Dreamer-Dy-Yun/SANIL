# Admin Screens

## 역할

`frontend/src/features/admin/`은 관리자 권한이 필요한 운영 화면을 둔다.

## 파일 역할

| 파일 | 역할 | 갱신 기준 |
|---|---|---|
| `AdminReferenceManagementPage.tsx` | 제품별 기준 사진 등록과 관리 | 기준 사진 등록 권한, 제품 선택, 등록 계약이 바뀔 때 |

## 경계 기준

- 검사 작업자가 쓰는 제품 선택/촬영 화면에 기준 사진 등록 기능을 섞지 않는다.
- 관리자 화면은 `ADMIN` 권한 route 뒤에서만 접근한다.
- 관리자 화면도 API fixture를 직접 참조하지 않고 `SanilApiClient` 계약만 사용한다.
