# Multi Agents

## 버전

0.1.0

## 역할

이 폴더는 SANIL 프로젝트의 멀티 에이전트 작업 규칙을 역할별 문서로 분리해 관리한다.

| 문서 | 역할 |
|---|---|
| `common-rules.md` | 공통 원칙, 파일 권한, 상태, 검증, 금지 사항 |
| `role-reference-map.md` | 역할별 참조 문서와 수정/생성 가능 범위 |
| `orchestrator.md` | plan 분석, todo 작성, 작업 경계 정의 |
| `sub-agent.md` | todo 기준 작업 수행, review 작성 |
| `qa.md` | review와 실제 파일 상태 검토, done/rejected 판단 |
| `md/` | plan, todo, review, done, qa 산출물 생명주기 |

## 핵심 원칙

- 역할 분리보다 파일 수정 권한 분리를 우선한다.
- 작업 단위는 작게 나눈다.
- 각 todo에는 수정 가능 파일, 생성 가능 파일, 읽기 전용 파일, 수정 금지 파일을 명시한다.
- Sub-Agent는 todo에서 지정된 범위 내의 파일만 수정 대상으로 삼는다.
- 하나의 파일 수정 권한은 하나의 Sub-Agent만 갖는다.
- todo의 파일 접근 권한 항목은 해당 작업의 파일 점유 선언으로 본다.
- plan, todo, review, done은 상태와 위치로 생명주기를 관리한다.
- QA는 review와 실제 파일 상태를 함께 검토한다.
- QA는 Explorer로 확인할 수 있으나 직접 수정하지 않는다.
- 실제 수정은 Worker(Sub-Agent)가 수행한다.

## 적용 상태

역할별 문서 분리가 완료되었으며 운영 기준은 이 문서와 각 역할 문서를 기준으로 한다.
