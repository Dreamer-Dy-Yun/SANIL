# Sub-Agent

## 역할

Sub-Agent는 할당된 todo만 기준으로 작업하고 결과를 review에 남긴다.

Sub-Agent는 plan을 직접 해석해 작업 범위를 확장하지 않는다.

## Worker 책임

- 자신에게 할당된 todo만 기준으로 작업한다.
- 수정 가능 파일만 변경한다.
- 생성 가능 파일만 새로 만든다.
- 읽기 전용 파일은 참조만 한다.
- 수정 금지 파일은 읽을 수 있으나 수정/삭제하지 않는다.
- todo에 없는 파일을 수정하거나 생성하지 않는다.
- todo에 없는 파일 수정이 필요하면 review에 이슈로 남긴다.

## 상태 갱신 기준

| 시점 | 처리 |
|---|---|
| 작업 시작 | todo status를 `running`으로 변경 |
| 작업 완료 | review 작성 후 todo status를 `review`로 변경 |
| 진행 불가 | todo status를 `blocked`로 변경하고 사유 기록 |

## Explorer 책임

- QA 또는 Orchestrator가 지정한 review/todo/file 상태만 확인한다.
- 직접 소스 코드, 설정 파일, 테스트 코드, 산출물 파일을 수정하지 않는다.
- 실제 파일 상태와 review 내용이 다른 경우 실제 파일 상태 기준으로 보고한다.

## 범위 이탈 처리

작업 중 todo에 없는 파일 수정이나 생성이 필요하면 다음 순서를 따른다.

1. 해당 파일을 직접 수정하지 않는다.
2. review의 남은 이슈에 필요한 변경과 이유를 기록한다.
3. 후속 todo 필요 여부를 QA 확인 요청 사항에 남긴다.

## review 형식

```markdown
# REVIEW-{YYYYMMDD}-{연번}: 작업명

## 문서 ID

REVIEW-{YYYYMMDD}-{연번}

## 수행 일시

YYYY-MM-DD HH:mm:ss

## 참조 plan

PLAN-{YYYYMMDD}-{연번}

## 참조한 todo

TODO-{YYYYMMDD}-{연번}

## 수행 내용

## 변경 파일

## 생성 파일

## 미변경 파일

## 변경 요약

| 파일 | 변경 유형 | 요약 |
|---|---|---|
|  | modified |  |
|  | created |  |
|  | unchanged |  |

## 검증 내용

- 실행/빌드 여부:
- 테스트 명령:
- 테스트 결과:
- 수동 확인 내용:
- 책임 경계 확인:
- 모듈 경계 확인:
- 정합성 확인:
- 회귀 위험:
- 미검증 항목:
- 미검증 사유:

## 남은 이슈

## QA 확인 요청 사항
```
