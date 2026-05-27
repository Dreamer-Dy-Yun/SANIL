# Role Reference Map

## 문서 목적

역할별로 반드시 읽어야 하는 문서와 수정/생성 가능한 문서 범위를 정의한다.

## 공통 참조 순서

모든 역할은 다음 순서를 따른다.

1. `common-rules.md`
2. `role-reference-map.md`
3. 자신의 역할 문서
4. 할당된 todo 또는 review
5. 참조 plan
6. 기존 review/done 기록

## 역할별 참조 문서

| 역할 | 필수 참조 문서 | 추가 참조 대상 |
|---|---|---|
| Orchestrator | `common-rules.md`, `role-reference-map.md`, `orchestrator.md` | `md/plan/active/*.md`, 기존 `md/todo/*.md`, `md/review/*.md`, `md/done/*.md` |
| Worker(Sub-Agent) | `common-rules.md`, `role-reference-map.md`, `sub-agent.md`, 할당된 todo | 참조 plan, todo에 명시된 읽기 전용 파일 |
| Explorer(Sub-Agent) | `common-rules.md`, `role-reference-map.md`, `sub-agent.md`, 할당된 review | 실제 파일 상태, 참조 todo, 참조 plan |
| QA | `common-rules.md`, `role-reference-map.md`, `qa.md`, 검토 대상 review | 실제 파일 상태, 참조 todo, 참조 plan, 기존 done/rejected 기록 |

## 역할별 수정/생성 가능 범위

| 역할 | 수정 가능 | 생성 가능 | 직접 수정 금지 |
|---|---|---|---|
| Orchestrator | `md/todo/*.md`, 필요 시 plan 상태 문서 | 신규 todo 문서 | 소스 코드, 테스트 코드, 산출물 |
| Worker(Sub-Agent) | 할당 todo의 수정 가능 파일, 할당 todo 상태 | 할당 todo의 생성 가능 파일, review 문서 | todo에 없는 파일, 읽기 전용/수정 금지 파일 |
| Explorer(Sub-Agent) | 없음 | 조사 결과가 요구된 경우 별도 허용된 review 보조 문서 | 소스 코드, 설정 파일, 테스트 코드, 산출물 |
| QA | review 이동, QA 판정 문서, todo 상태 판정 문서 | `md/qa/*.md`, reject 문서 | 소스 코드, 설정 파일, 테스트 코드, 산출물 |

## 문서 생명주기 위치

| 종류 | 위치 |
|---|---|
| active plan | `md/plan/active/` |
| done plan | `md/plan/done/` |
| canceled plan | `md/plan/archived/canceled/` |
| deferred plan | `md/plan/archived/deferred/` |
| superseded plan | `md/plan/archived/superseded/` |
| todo | `md/todo/` |
| review | `md/review/` |
| rejected review | `md/review/rejected/` |
| done artifact | `md/done/` |
| QA artifact | `md/qa/` |

## 충돌 방지 기준

- 파일 수정 권한 분리를 역할 분리보다 우선한다.
- 동일 파일의 수정 권한은 하나의 Sub-Agent에게만 부여한다.
- 공통 영향 파일은 하나의 todo에서만 수정한다.
- todo의 파일 접근 권한 항목은 파일 점유 선언으로 본다.
- todo와 plan이 충돌하면 Sub-Agent는 todo를 우선하고 충돌 내용은 review의 남은 이슈에 기록한다.
