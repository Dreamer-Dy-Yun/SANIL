# Styles

## 역할

`frontend/src/styles/`는 앱 전역 CSS를 책임 단위로 분리한다.

## 파일 역할

| 파일 | 역할 | 갱신 기준 |
|---|---|---|
| `base.css` | CSS 변수, reset, body 기본 스타일 | 전역 색상, 타이포, 기본 배경이 바뀔 때 |
| `layout.css` | 앱 shell, nav, page layout | 화면 골격이나 responsive layout이 바뀔 때 |
| `components.css` | 버튼, 카드, 목록, 촬영 화면, 결과 화면 스타일 | 컴포넌트 class 계약이 바뀔 때 |
| `selection.css` | 제품 선택 방식과 스캔 결과 표시 스타일 | 제품 선택 UI 방식이 바뀔 때 |
| `tablet.css` | M86XE 8 inch 1280 x 800 landscape 최적화 | 대상 장비 viewport 또는 현장 조작 기준이 바뀔 때 |
| `responsive.css` | 좁은 화면 대응 | breakpoint와 모바일 배치가 바뀔 때 |

## 경계 기준

- `styles.css`는 import 진입점으로 유지한다.
- 한 파일에 서로 다른 책임을 과도하게 섞지 않는다.
- class 이름은 화면 기능과 역할을 드러내도록 유지한다.
