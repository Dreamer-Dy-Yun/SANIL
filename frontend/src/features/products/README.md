# Products Feature

## 역할

`products/`는 QA 작업자가 검사할 제품을 선택하고 검사 세션 생성을 요청하는 화면을 책임진다.

## 공개 화면

| 파일 | 책임 | 변경 기준 |
|---|---|---|
| `ProductsPage.tsx` | 제품 목록 조회, 드롭다운 선택, 바코드/QR 촬영 결과를 제품 선택값에 반영, 검사 세션 시작 | 제품 선택 흐름 또는 세션 생성 계약이 바뀔 때 |

## 입력과 출력

- 입력 API: `SanilApiClient.listProducts()`, `SanilApiClient.findProductByCode(productCode)`
- 입력 장치: `ProductCodeScannerAdapter.captureProductCode()`
- 출력 API: `SanilApiClient.createInspectionSession(productUuid)`
- 화면 출력: 선택된 제품, 기준 사진 수, 기준 사진 조회 링크, 검사 시작 오류

## 경계 기준

- 제품 선택의 기준 상태는 드롭다운의 `selectedProductUuid`다.
- 바코드/QR 촬영은 제품을 직접 시작하지 않고, API 조회 결과를 드롭다운 선택값에 반영한다.
- 제품 코드와 일치하는 제품이 없으면 API 오류를 그대로 사용자에게 표시한다.
- 제품 카드는 이 화면의 책임이 아니며, 기준 사진 등록은 관리자 화면에서만 처리한다.
