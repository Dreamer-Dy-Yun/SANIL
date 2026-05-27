# SANIL Project Brief

## 고객/배경

- 고객사는 산일전기다.
- 최근 수출 품목에서 QA 문제가 발생해 큰 곤란을 겪은 것으로 파악된다.
- 고객사는 QA 판정 업무를 보조하거나 자동화하는 프로젝트를 요청했다.

## 초기 요청

| 요청 | 내용 | 현재 프로젝트 포함 여부 |
|---|---|---|
| 사진 기반 합부 판정 | 기준 대조군 사진과 QA 대상 사진을 비교해 합격/불합격을 판단 | 포함 |
| 도면 기반 치수/공차 판정 | 도면과 촬영 사진을 비교해 치수가 공차 이내인지 확인 | 제외 |

## 현재 프로젝트 범위

이번 프로젝트는 기준 사진과 QA 대상 사진을 VLM/LLM으로 비교해 합부 판정을 보조하는 웹앱 또는 앱을 대상으로 한다.

치수/공차 판정은 일반 사진만으로 보증하기 어렵기 때문에 현재 범위에서 제외한다. 대안은 [dimension-check-alternatives.md](dimension-check-alternatives.md)에 별도 정리한다.

## 주요 사용자

- QA 촬영자
- QA 관리자
- 시스템 관리자

사내용 시스템이지만 QA 추적성이 필요하므로 촬영자 로그인 정보와 검사 이력은 필수로 본다.

## 관련 문서

- [scope.md](scope.md): 포함/제외 범위
- [system-design.md](system-design.md): 전체 시스템 설계
- [device-constraints.md](device-constraints.md): 고객 사용 태블릿과 촬영 장비 제약
- [functional-decomposition.md](functional-decomposition.md): 기능 단위 분해와 책임 경계
- [dependency-injection-and-patterns.md](dependency-injection-and-patterns.md): DI, factory, adapter, strategy 등 패턴 사용 기준
- [photo-qa-workflow.md](photo-qa-workflow.md): 사진 기반 QA 판정 흐름
- [implementation-principles.md](implementation-principles.md): 구현 원칙과 금지선
- [dimension-check-alternatives.md](dimension-check-alternatives.md): 치수/공차 판정 대안
- [mvp-roadmap.md](mvp-roadmap.md): MVP 단계별 구현 계획
- [../../backend/docs/database/README.md](../../backend/docs/database/README.md): DB 설계 기준
- [../../frontend/docs/README.md](../../frontend/docs/README.md): 프론트엔드 설계 기준
