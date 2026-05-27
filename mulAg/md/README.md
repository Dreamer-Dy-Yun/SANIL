# Workflow Artifacts

## 역할

`mulAg/md/`는 plan, todo, review, done, qa 문서의 생명주기 위치다.

## 폴더 구조

```text
md/
├── plan/
│   ├── active/
│   ├── done/
│   └── archived/
│       ├── canceled/
│       ├── deferred/
│       └── superseded/
├── todo/
├── review/
│   └── rejected/
├── done/
└── qa/
```

## 문서 연결 규칙

문서 간 연결은 파일명 추정이 아니라 문서 내부 참조 항목으로 명시한다.

```markdown
## 문서 ID
TODO-20260522-001

## 참조 plan
PLAN-20260522-001

## 참조 review
REVIEW-20260522-001
```

## 갱신 기준

- plan/todo/review/done 위치나 상태 의미가 바뀌면 이 문서를 갱신한다.
- 새 산출물 유형이 생기면 `role-reference-map.md`와 함께 갱신한다.
