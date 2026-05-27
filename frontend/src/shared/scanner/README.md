# Product Code Scanner

## 역할

`frontend/src/shared/scanner/`는 바코드/QR 촬영으로 얻은 제품 코드를 화면에 전달하는 adapter 경계다.

## 파일 역할

| 파일 | 역할 | 갱신 기준 |
|---|---|---|
| `productCodeScannerAdapter.ts` | 제품 코드 스캔 결과와 scanner adapter interface | scan result, format, captured image 계약이 바뀔 때 |
| `mockProductCodeScanFixture.ts` | mock scan 결과 원천 데이터 | mock scan 대상 제품 코드가 바뀔 때 |
| `mockProductCodeScannerAdapter.ts` | mock mode에서 카메라 촬영 후 고정 제품 코드를 반환하는 구현 | mock scan 시나리오나 fixture 코드가 바뀔 때 |

## 경계 기준

- 제품 화면은 디코더 구현이나 fixture를 직접 알지 않는다.
- scanner adapter는 제품 정보를 만들지 않고 raw code만 반환한다.
- raw code와 제품 매핑은 `SanilApiClient.findProductByCode()`가 책임진다.
