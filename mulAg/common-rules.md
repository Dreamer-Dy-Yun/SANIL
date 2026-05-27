# Common Rules

## 문서 목적

공통 원칙, 파일 접근 권한, 작업 단위, 상태, 검증, 금지 사항을 정의한다.

## 문서 명명 규칙

문서 파일명은 다음 규칙을 따른다.

```text
{종류}-{YYYYMMDD}-{연번}.md
```

예시:

```text
PLAN-20260522-001.md
TODO-20260522-001.md
REVIEW-20260522-001.md
DONE-20260522-001.md
QA-REJECT-20260522-001.md
```

문서 간 연결은 파일명으로 추정하지 말고 문서 내부 참조 항목에 명시한다.

## 문서 참조 우선순위

각 Agent는 작업 시작 시 다음 순서로 문서를 참조한다.

1. `common-rules.md`
2. `role-reference-map.md`
3. 자신의 역할 문서
4. 할당된 todo 또는 review
5. 참조 plan
6. 기존 review/done 기록

Sub-Agent의 실제 작업 범위는 todo를 최우선 기준으로 한다.

## 전체 흐름

```text
plan/active/
  ↓
Orchestrator가 todo 작성
  ↓
todo/
  ↓
Sub-Agent가 작업 수행
  ↓
review/
  ↓
QA가 review + Explorer로 검토
  ↓
done/ 또는 review/rejected/
  ↓
필요 시 후속 todo 작성
  ↓
plan/done/ 또는 plan/archived/
```

## 파일 접근 권한

모든 todo에는 파일 접근 권한을 명시한다.

| 권한 | 의미 |
|---|---|
| 수정 가능 파일 | 해당 Sub-Agent가 직접 수정할 수 있는 파일 |
| 생성 가능 파일 | 해당 Sub-Agent가 새로 만들 수 있는 파일 |
| 읽기 전용 파일 | 작업 수행을 위해 참조해야 하지만 수정/삭제할 수 없는 파일 |
| 수정 금지 파일 | 읽을 수는 있으나 수정/삭제할 수 없는 보호 대상 파일 |

todo의 수정 가능 파일과 생성 가능 파일은 해당 작업의 파일 점유 선언으로 본다.

## todo 상태

todo에는 반드시 상태를 명시한다.

```markdown
## 상태

- status: pending | assigned | running | review | done | rejected | blocked | canceled
- assigned_to:
- updated_at:
```

| 상태 | 의미 |
|---|---|
| pending | 작성되었으나 아직 할당되지 않음 |
| assigned | Worker에게 할당됨 |
| running | Worker 작업 중 |
| review | review 작성 후 QA 검토 대기 |
| done | QA 승인 완료 |
| rejected | QA 반려 |
| blocked | 선행 조건, 정보 부족, 권한 문제 등으로 진행 불가 |
| canceled | 더 이상 수행하지 않음 |

## plan 상태

| 상태 | 의미 |
|---|---|
| active | 진행 중이거나 todo 분해가 필요한 계획 |
| done | 관련 todo/review가 모두 완료된 계획 |
| canceled | 폐기된 계획 |
| deferred | 보류된 계획 |
| superseded | 다른 계획으로 대체된 계획 |

`plan/done/`과 `done/`은 구분한다.

- `plan/done/`: 완료된 계획, 요구사항, 설계 기준 기록
- `done/`: 완료된 todo/review 작업 결과 기록

대체된 plan에는 다음을 남긴다.

```markdown
## archived reason

superseded

## replaced by

PLAN-{YYYYMMDD}-{연번}
```

## review 필수 항목

review에는 다음 항목을 반드시 포함한다.

- 수행 일시
- 참조 plan
- 참조 todo
- 수행 내용
- 변경 파일
- 생성 파일
- 미변경 파일
- 변경 요약
- 검증 내용
- 남은 이슈
- QA 확인 요청 사항

## 공통 검증 기준

Sub-Agent와 QA는 최소한 다음을 확인한다.

| 기준 | 확인 내용 |
|---|---|
| 책임 경계 | todo 책임 범위를 벗어나지 않았는가 |
| 모듈 경계 | 입력/출력 계약이 유지되고 내부 구현 세부사항이 외부로 새지 않는가 |
| 정합성 | 기존 데이터 구조, 타입, 인터페이스와 충돌하지 않는가 |
| 파일 권한 | 수정 가능/생성 가능 파일 범위만 사용했는가 |
| 선행 조건 | 선행 todo 또는 선행 review가 완료되었는가 |
| 실행 가능성 | 최소 실행 또는 빌드가 가능하고 import/reference 오류가 없는가 |
| 테스트 및 확인 | 가능한 자동 테스트 또는 수동 확인 결과가 있는가 |
| 회귀 위험 | 기존 기능을 깨뜨릴 가능성과 영향 범위를 기록했는가 |

## 공통 영향 파일

다음 파일은 공통 영향 파일로 본다.

- `package.json`
- `requirements.txt`
- `pyproject.toml`
- `README.md`
- `.env.example`
- index 파일
- `__init__.py`
- router 등록 파일
- DI/container 설정 파일
- 공통 type/interface 파일
- migration 파일

공통 영향 파일은 원칙적으로 하나의 todo에서만 수정한다.

## 금지 사항

- todo에 없는 파일 수정
- 수정 가능 파일에 없는 파일 수정
- 생성 가능 파일에 없는 파일 생성
- 동일 파일을 여러 Sub-Agent가 동시에 수정
- 선행 조건이 완료되지 않은 후속 todo 수행
- review 없이 done 처리
- 완료된 plan을 `plan/active/`에 방치
- QA가 소스 코드, 설정 파일, 테스트 코드, 산출물 파일 직접 수정
- QA 검토 없이 plan/todo 임의 변경
- Sub-Agent가 plan을 근거로 todo 범위 임의 확장
