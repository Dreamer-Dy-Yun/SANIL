# Dimension Check Alternatives

## 현재 판단

도면 기반 치수/공차 판정은 1차 프로젝트 범위에서 제외한다.

일반 카메라 사진만으로 치수를 보증하려면 렌즈 왜곡, 원근, 제품 자세, 촬영 거리, 깊이 정보, 조명, 기준 스케일 문제가 모두 해결되어야 한다. 수출 QA와 연결되는 업무에서는 보증 불가능한 치수 결과를 제공하면 안 된다.

## 가능한 대안

| 대안 | 가능 범위 | 제한 |
|---|---|---|
| 고정 지그 + 보정 카메라 + 기준 스케일 | 평면에 가까운 부품의 2D 치수 측정 | 지그, 보정 절차, 조명, 렌즈 왜곡 관리가 필수 |
| 텔레센트릭 렌즈 기반 2D 비전 계측 | 반복 생산품의 외곽/홀/간격 등 2D 계측 | 측정 대상이 시야와 심도 범위 안에 있어야 하며 장비 비용 발생 |
| 포토그래메트리 + 타겟/스케일바 | 큰 물체의 3D 좌표 추정과 일부 길이 측정 | 다중 촬영, 타겟 부착, scale bar, 불확도 검증이 필요 |
| 구조광/레이저 3D 스캐너 | 3D 형상 기반 치수 검사 | 장비 도입, 표면 재질 대응, 캘리브레이션, 공정 검증 필요 |
| CMM/비전 측정기 연동 | 공차 보증이 필요한 정식 계측 | 별도 계측 공정/장비와 데이터 연동 필요 |

## 제안

1차 프로젝트에서는 치수/공차 판정을 "불가"가 아니라 "별도 계측 공정 필요"로 표현한다.

추가 제안:

- 고객이 특정 치수 몇 개만 요구한다면, 제품을 고정 지그에 놓고 텔레센트릭 렌즈/보정 카메라로 2D 치수만 검증하는 PoC를 별도 제안할 수 있다.
- 도면 전체 치수 검증이나 3D 형상 공차 검증이 필요하면 3D 스캐너 또는 CMM/비전 측정기 연동을 별도 프로젝트로 분리한다.
- 현재 사진 기반 QA 앱에는 "도면 치수 보증" 문구를 넣지 않는다.
- 대신 도면 기반 체크리스트, 촬영 위치 가이드, 누락/오조립/외관 이상 탐지는 보조 기능으로 검토할 수 있다.

## 참고 근거

- OGP는 영상 계측에서 텔레센트릭 광학계가 원근/왜곡 문제를 줄여 정확한 측정에 중요하다고 설명한다: [OGP Telecentric Optics](https://www.ogpnet.com/ogp-blog/telecentric-optics-why-is-telecentricity-so-important-in-dimensional-metrology/)
- Geodetic Systems는 포토그래메트리 측정이 카메라 품질, 대상 크기, 사진 수, 촬영 기하에 좌우되고 scale bar 같은 알려진 거리가 필요하다고 설명한다: [What is Photogrammetry?](https://www.geodetic.com/v-stars/what-is-photogrammetry/)
- 대형 계측 포토그래메트리 연구는 산업 현장에서 정확도/신뢰성 평가와 표준화 문제가 중요하며, scale bar와 보정된 기준물이 필요하다고 다룬다: [MDPI Portable Photogrammetry for Large-Volume Metrology](https://www.mdpi.com/2673-8244/2/3/20)
- NIST의 광학/좌표 측정 시설 설명은 정밀 광학 측정이 보정된 스테이지, 표준, 왜곡 보정과 연결된다는 점을 보여준다: [NIST Optical Aperture Area and Coordinate Measurement Facility](https://www.nist.gov/laboratories/tools-instruments/optical-aperture-area-and-coordinate-measurement-facility)
