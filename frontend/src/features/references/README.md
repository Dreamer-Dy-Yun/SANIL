# Reference Screens

## 역할

`frontend/src/features/references/`는 제품별 기준 사진과 촬영 가이드를 조회하는 화면과 표시 전용 목록 컴포넌트를 둔다.

## 파일 역할

| 파일 | 역할 | 갱신 기준 |
|---|---|---|
| `ReferenceListPage.tsx` | `/products/:productUuid/references`에서 작업자가 기준 사진을 조회하는 읽기 전용 화면 | 조회 라우트, 기준 사진 표시 계약, 작업자 접근 의미가 바뀔 때 |
| `ReferenceShotList.tsx` | `ReferenceShot[]`을 단계 순서와 이미지/가이드 상태로 표시하는 presentational 목록 | 기준 사진 표시 필드나 빈 상태 표현이 바뀔 때 |

## 경계 기준

- 이 폴더는 `listReferenceShots` 결과를 화면에 표시하며 기준 사진 생성, 수정, 삭제 이벤트를 만들지 않는다.
- 기준 사진 등록과 순서 관리는 `frontend/src/features/admin/AdminReferenceManagementPage.tsx`의 관리자 책임이다.
- 화면과 컴포넌트는 API fixture나 mock 데이터를 직접 참조하지 않고 `SanilApiClient` 뒤의 계약만 사용한다.
- 기준 사진에 이미지, 비고, 가이드 영역이 없으면 임의 값을 만들지 않고 없음 상태를 그대로 표시한다.
