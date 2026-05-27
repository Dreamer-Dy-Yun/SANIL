# Admin Screens

## 역할

`frontend/src/features/admin/`은 관리자 권한이 필요한 운영 화면을 둔다. 기준 사진 등록, 순서 지정, 비고 입력처럼 검사 기준을 바꾸는 기능은 이 폴더의 관리자 화면 책임이다.

## 파일 역할

| 파일 | 역할 | 갱신 기준 |
|---|---|---|
| `AdminReferenceManagementPage.tsx` | 제품별 기준 사진 등록과 관리자 편집 목록 표시 | 기준 사진 등록 권한, 제품 선택, 등록 계약이 바뀔 때 |

## 경계 기준

- 검사 작업자가 쓰는 제품 선택/촬영 화면에 기준 사진 등록 기능을 섞지 않는다.
- 관리자 화면은 `ADMIN` 권한 route 뒤에서만 접근한다.
- 관리자 화면도 API fixture를 직접 참조하지 않고 `SanilApiClient` 계약만 사용한다.
- 기준 사진 등록 이벤트는 `listProducts`로 관리 대상 제품을 고르고 `listReferenceShots`로 기존 기준을 확인한 뒤 `createReferenceShot`으로 등록한다.
- `/products/:productUuid/references`는 작업자 조회 화면이며 등록/수정 이벤트를 갖지 않는다.
- `ReferenceShotList`는 표시 전용 목록 컴포넌트로 공유할 수 있지만, 생성/수정 책임은 `AdminReferenceManagementPage.tsx` 안에 둔다.
