# Plan

## 역할

`plan/`은 요구사항, 설계 기준, 작업 분해 전후의 계획 상태를 보관한다.

## 하위 폴더

| 경로 | 역할 |
|---|---|
| `active/` | 진행 중이거나 todo 분해가 필요한 계획 |
| `done/` | 관련 todo/review가 모두 완료된 계획 |
| `archived/` | 폐기, 보류, 대체된 계획 |

## 상태

- active
- done
- canceled
- deferred
- superseded

## 주의사항

- Orchestrator는 plan을 todo로 분해하지만 plan 완료를 선언하지 않는다.
- plan 완료 여부는 QA가 판단한다.
- 완료된 plan을 `active/`에 방치하지 않는다.
