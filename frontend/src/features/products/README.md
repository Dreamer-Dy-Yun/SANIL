# Products Feature

## 역할

`products/`는 QA 작업자가 태블릿 첫 화면에서 검사할 제품을 선택하고 검사 세션 생성을 요청하는 화면을 책임진다.

## 공개 화면

| 파일 | 책임 | 변경 기준 |
|---|---|---|
| `ProductsPage.tsx` | 제품 목록 조회, 드롭다운 선택, 바코드/QR 카메라 화면, 촬영 결과를 제품 선택값에 반영, 검사 세션 시작 | 제품 선택 흐름 또는 세션 생성 계약이 바뀔 때 |

## 입력과 출력

- 입력 API: `SanilApiClient.listProducts()`, `SanilApiClient.findProductByCode(productCode)`
- 입력 장치: `ProductCodeScannerAdapter.captureProductCode()`
- 출력 API: `SanilApiClient.createInspectionSession(productUuid)`
- 화면 출력: 선택된 제품, 기준 사진 수, 바코드/QR 카메라 프레임, 선택 상태에 따라 전환되는 단일 CTA, 검사 시작 오류

## 이벤트 흐름

| 이벤트 | 발생 지점 | 처리 흐름 | 실패 처리 |
|---|---|---|---|
| 제품 목록 조회 | 화면 진입 | `SanilApiClient.listProducts()`로 드롭다운 후보를 가져온다. | 조회 실패 시 공통 오류 화면을 표시한다. |
| 드롭다운 선택 | 제품 선택 필드 | 선택한 `productUuid`를 화면 선택 상태로 저장한다. | 후보가 없으면 선택 필드를 비활성화한다. |
| 코드 촬영 | 제품 미선택 상태의 단일 CTA | `ProductCodeScannerAdapter.captureProductCode()`로 raw code를 받고 `SanilApiClient.findProductByCode()` 조회 결과를 드롭다운 선택값에 반영한다. | 미등록/검증 오류는 선택값을 비우고 API 오류 메시지를 표시한다. |
| 검사 시작 | 제품 선택 상태의 같은 단일 CTA | 선택된 `productUuid`로 `SanilApiClient.createInspectionSession()`을 호출하고 촬영 화면으로 이동한다. | API 실패 메시지를 표시한다. |

## 경계 기준

- 제품 선택의 기준 상태는 드롭다운의 `selectedProductUuid`다.
- 바코드/QR 카메라 화면은 기본 노출하고, 촬영 결과는 제품을 직접 시작하지 않고 API 조회 결과를 드롭다운 선택값에 반영한다.
- 하단 액션은 하나의 CTA만 둔다. 제품 미선택 시 `코드 촬영`, 제품 선택 시 `검사 시작`으로 문구와 동작을 전환한다.
- 제품 코드와 일치하는 제품이 없으면 API 오류를 그대로 사용자에게 표시한다.
- 제품 카드는 이 화면의 책임이 아니며, 기준 사진 등록은 관리자 화면에서만 처리한다.
- mock 데이터와 스캔 fixture는 화면 파일에 두지 않고 `src/api`와 scanner adapter 경계 뒤에 둔다.
