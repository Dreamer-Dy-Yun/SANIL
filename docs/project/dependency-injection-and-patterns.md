# Dependency Injection and Patterns

## 원칙

모든 구현은 의존성 주입을 기본으로 한다.

전역 변수는 만들지 않는 것을 원칙으로 한다. 불가피한 경우에도 immutable config 상수 수준으로 제한하고, 상태를 가진 전역 singleton은 금지한다.

## DI 기준

- 기능 코드는 구체 구현이 아니라 interface에 의존한다.
- HTTP client, mock client, storage, VLM provider, clock, uuid generator, logger는 직접 import하지 않고 주입받는다.
- 객체 생성과 의존성 연결은 composition root에서만 수행한다.
- 테스트는 같은 interface의 fake/stub 구현체를 주입한다.
- 모듈 import 시 네트워크 연결, DB 연결, 파일 생성 같은 side effect를 만들지 않는다.

## Composition Root

| 영역 | Composition Root |
|---|---|
| Frontend | `src/app/` 또는 `src/api/adapters/createSanilApiClient.ts` |
| Backend | `create_app()` 또는 `build_container()` 같은 앱 팩토리 |
| Worker/Queue | worker entrypoint의 factory 함수 |
| Test | test setup 또는 fixture factory |

Composition root 밖에서는 구체 구현체를 직접 조립하지 않는다.

## 허용 패턴

패턴은 필요할 때 적극적으로 사용한다. 단, 책임 경계를 명확히 하거나 구현체 교체 비용을 낮추는 경우에만 사용한다.

| 패턴 | 사용할 곳 | 이유 |
|---|---|---|
| Factory | API client, repository, VLM provider, storage adapter 생성 | 환경별 구현체 선택과 생성 책임 분리 |
| Adapter | HTTP/mock API, image storage, VLM provider | 외부 시스템 세부를 내부 계약 뒤로 숨김 |
| Strategy | VLM provider 선택, 결과 집계 정책, guide extraction 정책 | 정책 교체 가능성 확보 |
| Repository | DB 테이블 접근 | SQL/ORM 세부를 서비스에서 분리 |
| Unit of Work | 이미지 저장 + DB 기록 + 큐 등록처럼 트랜잭션 경계가 필요한 작업 | 부분 성공 방지 |
| State Machine | 검사 세션과 촬영 단계 상태 전이 | 잘못된 상태 전이를 방지 |
| Builder | VLM prompt, multipart upload request | 복잡한 입력 조립을 명시화 |

## 패턴 금지선

- 단순 함수 하나로 충분한 곳에 class hierarchy를 만들지 않는다.
- 줄 수 감소만을 위해 책임이 다른 기능을 하나로 합치지 않는다.
- factory가 비즈니스 판단을 수행하지 않는다.
- service locator처럼 어디서든 꺼내 쓰는 전역 container를 만들지 않는다.
- React context를 전역 상태 저장소처럼 남용하지 않는다.

## Frontend DI 예시

```ts
export interface SanilApiClient {
  listProducts(): Promise<ProductSummary[]>;
  createInspectionSession(productUuid: Uuid): Promise<InspectionSession>;
}

export interface ProductCatalogDependencies {
  apiClient: SanilApiClient;
}

export function createProductCatalogService(deps: ProductCatalogDependencies) {
  return {
    listProducts: () => deps.apiClient.listProducts(),
  };
}
```

위 구조에서 `ProductCatalogService`는 HTTP인지 mock인지 알지 않는다.

## Backend DI 예시

```py
class InspectionSessionService:
    def __init__(self, repository, image_store, comparison_queue, uuid_generator):
        self._repository = repository
        self._image_store = image_store
        self._comparison_queue = comparison_queue
        self._uuid_generator = uuid_generator
```

서비스는 DB driver, storage SDK, queue SDK를 직접 생성하지 않는다.

## 전역 변수 기준

허용 가능:

- enum 값
- route path 상수
- 순수 설정 schema
- 변하지 않는 UI label map

금지:

- mutable session state
- current user 전역 객체
- 전역 API client singleton
- 전역 DB connection singleton
- 전역 mock data 배열
- import 시 자동 실행되는 작업 큐/네트워크 요청

## 문서화 기준

새 factory/adapter/strategy/repository를 만들면 해당 feature README에 다음을 기록한다.

- interface 이름
- 구현체 목록
- 생성 위치
- 주입받는 의존성
- 실패 처리 방식
- 테스트 대체 구현체
