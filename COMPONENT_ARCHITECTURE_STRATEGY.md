# OnceHuman Support - 컴포넌트 아키텍처 및 재사용성 전략 (수정본 v3)

**목표**: SmartSelect 성공 사례를 기반으로 전체 프로젝트의 재사용성과 중앙화를 극대화하는 아키텍처 설계

> **중요 변경점 요약**
> - Vuetify API는 **참조용**으로만 남기고, 프로젝트에 직접 채택하지 않습니다. shadcn/ui의 기본 API를 우선으로 하되, shadcn/ui에 없는 기능을 추가할 때의 네이밍과 확장성 가이드라인을 문서에 명확히 추가했습니다.
> - `coop-timer`의 페이지 내부 로직은 **페이지 내에 유지**하되, 진짜 재사용이 필요한 부분만 훅으로 분리하도록 기준을 보강했습니다. 컴포넌트별로 훅을 분리해야 할 때의 디렉토리 위치와 네이밍 규칙을 제시했습니다.
> - `CategorySection`은 현재 도메인 특화 컴포넌트이므로 `components/<foldername>/` 형태로 루트 components 폴더 바로 아래로 이동시키고, 공통 컴포넌트로서의 적합성 재검토 절차를 문서화했습니다.
> - `components/base`와 `components/ui`의 역할을 명확히 정의했습니다: `base`는 shadcn/ui 원본(primitive) 보관소, `ui`는 shadcn/ui를 래핑하거나 기능을 추가한 재사용 가능한 커스텀 컴포넌트 모음입니다. `ui` 폴더의 컴포넌트는 현재 프로젝트의 상태관리 프레임워크에 의존하면 안 됩니다.
> - `coop-timer`의 레이아웃/디자인을 **프로젝트 UI 기준**(visual baseline)으로 사용하는 권장안과, 이를 안전하게 타 페이지로 확장하는 방법을 추가했습니다.

---

## 🔍 현재 프로젝트 구조 분석

### 1. 페이지별 구조 현황

#### ✅ Coop Timer (Vue 스타일 - 모범 사례)
```
app/coop-timer/
├── components/           # 페이지 전용 컴포넌트
├── hooks/                # 페이지 전용 로직 (재사용성 있는 것만)
├── lib/                  # 페이지 전용 비즈니스 로직
├── data/                 # 페이지 전용 데이터
└── page.tsx              # 페이지 진입점
```
**정책 추가**: `coop-timer`의 경우 페이지 내부 로직을 page.tsx에 둔 상태가 가독성과 유지보수에 유리합니다. 훅으로 분리할 때는 아래의 훅 분리 기준과 디렉토리 규칙을 따릅니다.

#### ⚠️ Switch Point (Context 패턴 - 과도한 추상화)
```
app/switch-point/
├── components/          
│   ├── content/dashboard/
│   ├── content/detail/sections/
│   ├── content/detail/widgets/
│   └── shared/
├── contexts/            # Context API 사용
├── hooks/               # 최소한의 hooks
├── lib/                 # 비즈니스 로직
└── data/                # 정적 데이터
```
**정책 추가**: Context를 남발하지 않고, 페이지 경계 내에서 해결 가능한 상태는 페이지 내부로 옮깁니다. 공유 상태가 정말로 여러 페이지/앱 레벨에서 필요할 경우에만 Context를 사용합니다.

#### ❌ Character (과도한 hooks 분리)
```
app/character/
├── components/
├── hooks/               # 페이지 전용 로직이 분리됨
└── table/               # 테이블 전용 구조
```
**정책 추가**: 페이지 전용 훅은 기본적으로 page.tsx로 통합하고, 재사용 가능성이 있는 로직만 `hooks/`로 유지.

---

## 🎯 SmartSelect 성공 요인 분석 (참조)

SmartSelect의 장점은 설계가 명확하고 재사용성이 높다는 점입니다. 다만 **Vuetify API(itemText/itemValue 등)** 는 프로젝트에 *직접 채택하지 않습니다* — **참조용**으로만 사용하세요. 대신 shadcn/ui의 기본 API와 조합해 확장할 때는 아래의 네이밍/확장성 가이드라인을 따릅니다.

### shadcn/ui 우선 원칙 & 확장 가이드라인
- **우선 사용**: shadcn/ui에서 제공하는 primitive와 API를 우선 사용합니다. (Input, Select, Label, Tooltip 등)
- **참조만**: Vuetify 스타일의 prop 네이밍(itemText/itemValue 등)은 참조로 남깁니다. 만약 shadcn/ui에 같은 기능이 없다면, 다음 가이드를 따라 새로운 prop을 추가하세요.

#### 네이밍 및 확장 제안 (예)
- `itemText`/`itemValue` 대신: `labelProp?: keyof T | ((item: T) => string)` / `valueProp?: keyof T | ((item: T) => string)`
- 렌더 커스터마이징: `renderItem?: (item: T, index: number) => ReactNode` (render function은 옵션)
- 동작 분리: `dataProps`, `behaviorProps`, `uiProps` 같은 그룹화된 인터페이스로 API를 설계하여 확장 시 충돌 최소화

#### 권장 패턴
- **기본 API는 간결하게**: primitive 사용자는 빠르게 도입할 수 있도록 기본 prop을 최소화합니다.
- **고급 사용자는 확장 가능하게**: renderFn, slots, or render props를 통해 전체 제어 제공.
- **타입 안정성**: Generic과 조건부 타입을 적극 활용하여 컴파일 시점에서의 인자 검사를 보장.

---

## 📋 공통 컴포넌트 분리 후보 (업데이트)

### 1. 즉시 분리 가능 (우선순위: 높음)

#### CharacterSelector
**현상**: 페이지별로 다른 구현이 존재함.

**개선 방안**: SmartSelect 개념을 유지하되, shadcn/ui를 기반으로 한 통합 컴포넌트를 만듭니다. Vuetify 네이밍은 참조만 하고, 실제 prop 네이밍은 위 확장 가이드라인을 따릅니다.

사용 예:
```tsx
<CharacterSelector<T>
  items={characters}
  value={selectedId}
  onChange={setSelectedId}
  variant="compact" | "detailed"
  showScenario={true}
  showServer={true}
/>
```

**구현 위치(업데이트)**: `components/character-selector/`

**주의 및 추가 가이드**:
- `components/ui/`는 **프로젝트 범위를 넘는(reusable across many projects)** 커스텀 컴포넌트의 집합입니다. 이 폴더의 컴포넌트는 *프로젝트의 상태관리 프레임워크(예: Redux, Zustand 등)에 의존해서는 안 됩니다*.
- 이번 결정에서는 CharacterSelector를 **현재 프로젝트에서 우선 사용되는 컴포넌트**로 보고 `components/character-selector/`로 배치합니다. 만약 향후 CharacterSelector가 여러 프로젝트에서 재사용되어야 하고, 그때는 `components/ui/character-selector/`로 이동시키되, 이동 전에는 다음을 점검하세요:
  1. 모든 외부 의존성을 props/slots로 치환했는가?
  2. 글로벌 상태에 접근하지 않는가?
  3. API가 범용적으로 설계되었는가? (labelProp/valueProp, renderItem 등)

이후 라이브러리화 계획이 확정되면 `components/ui/`로 옮기되, 위 조건을 충족해야 합니다.

---

#### EmptyState
**현상**: 페이지마다 다른 빈 상태 컴포넌트가 존재.

**개선 방안**: 통합 EmptyState 컴포넌트 생성. variant 기반으로 렌더링 분기.

사용 예:
```tsx
<EmptyState
  icon={Users}
  title="캐릭터가 없습니다"
  description="먼저 캐릭터를 등록해주세요"
  action={<Button>캐릭터 등록</Button>}
  variant="no-data" | "no-results" | "error"
/>
```

**구현 위치**: `components/ui/empty-state/`

---

#### FormField
**현상**: 반복되는 Label + Input + Error 패턴

**개선 방안**: FormField 컴포넌트로 통합하고, 내부에 primitive(Input, Select 등)를 슬롯으로 주입.

**구현 위치**: `components/ui/form-field/`

---

### 2. 중기 분리 검토 (우선순위: 중간)

#### PageHeader, ActionButton 등
- 공통 규칙(타이포, 스페이싱, 토큰)을 준수하도록 통합

---

### 3. 도메인 특화 컴포넌트 (우선순위: 낮음)
- **정책**: 도메인 특화 컴포넌트는 `components/<폴더이름>/` 형태로 **루트 components 폴더 바로 아래**에 둡니다. 예: `components/CategorySection/`.
- **CategorySection**: coop-timer에 강하게 결합되어 있으므로 `components/CategorySection/`으로 이동시키고, 정말 공통 컴포넌트로 분리가 필요한 지 검토합니다.

---

## 🏗️ Vue 스타일 폴더 구조 표준화 (보완)

### 권장 페이지 구조 (coop-timer 기준)
```
app/[page-name]/
├── components/          # 페이지 전용 컴포넌트
│   ├── [feature-name].tsx
│   └── sections/        # 큰 섹션들
├── lib/                 # 페이지 전용 비즈니스 로직
├── data/                # 정적 데이터 (JSON, 상수)
├── types/               # 페이지 전용 타입 (필요시)
├── metadata.ts          # SEO 메타데이터
└── page.tsx             # 페이지 진입점 (로직 포함)
```

**추가 규칙**:
- 페이지 전용 간단 상태는 `page.tsx`에 유지. 복잡하거나 재사용이 명확한 로직만 `hooks/`로 분리.
- 컴포넌트별 훅이 필요한 경우, 해당 컴포넌트 폴더 아래 `hooks/`를 둡니다. 예: `components/MyWidget/hooks/useWidgetLogic.ts`

---

## 🚫 Hooks 분리 기준 정립 (업데이트)

### ✅ Hooks로 분리해야 하는 경우
1. **여러 페이지에서 재사용**: use-mobile, use-local-storage 등
2. **복잡한 상태 로직**: 여러 useEffect와 상태 연관성 존재
3. **테스트 격리 필요**: 비즈니스 로직 단위 테스트 용이
4. **상태가 컴포넌트 경계를 넘는 경우**: 다수 컴포넌트에서 동일 로직 사용

### ❌ Hooks로 분리하지 말아야 하는 경우
1. **페이지 전용 단순 로직**: CRUD의 단순 래핑
2. **UI 상태 관리(모달, 토글 등)**: 컴포넌트 내부에 남겨두기
3. **한번 사용되는 비즈니스 흐름**: 단일 페이지/컴포넌트 전용

### 훅 분리 시 위치 규칙
- 전역 재사용 훅: `lib/hooks/` 또는 `components/hooks/`
- 컴포넌트 전용 훅: `components/<ComponentName>/hooks/`
- 페이지 전용 큰 훅(다수 컴포넌트 사용): `app/<page>/hooks/`

---

## 🎨 UI 통일성: Coop-Timer를 시각적 베이스로 사용하기

**정책 제안**:
- Coop-Timer의 레이아웃/마진/타이포/컴포넌트 스타일을 프로젝트의 시각적 *baseline*으로 채택
- baseline을 채택하되, 각 페이지의 도메인 요구사항으로 예외를 둘 수 있음
- baseline 적용 방식:
  1. 디자인 토큰(변수) 추출: spacing, radii, colors, fontSizes 등
  2. 공통 레이아웃 컴포넌트 작성: `components/layout/AppShell`, `components/layout/ContentCard` 등
  3. 페이지별 마이그레이션 가이드 작성: 변경점과 예외 목록을 문서화

---

## 📅 실행 계획 (업데이트)

### Phase 1: 즉시 개선 (2주)
**Week 1**: Character 페이지 리팩토링
- [ ] `use-character-management`를 page.tsx로 통합 (페이지 전용 로직)
- [ ] 불필요한 hooks 폴더 정리
- [ ] CategorySection을 `components/` 바로 아래로 이동 및 문서화

**Week 2**: EmptyState 통합 & shadcn/ui 확장 가이드 적용
- [ ] `components/ui/empty-state` 생성
- [ ] 각 페이지의 빈 상태 교체
- [ ] shadcn/ui 확장 네이밍 규칙 문서화

### Phase 2: 공통 컴포넌트 확장 (2-3주)
**Week 3**: CharacterSelector 구현 (shadcn/ui 기반)
- [ ] Generic 기반 타입 설계
- [ ] Coop-timer, Switch-point에 적용

**Week 4**: FormField 구현 및 디자인 토큰 추출
- [ ] `components/ui/form-field` 생성
- [ ] 디자인 토큰(variables) 추출 및 AppShell 제작

### Phase 3: 아키텍처 표준화 (3-4주)
**Week 5**: Switch-Point 구조 개선
- [ ] Context 감축, page 단위로 로직 이동

**Week 6**: 문서화 및 가이드라인 정리
- [ ] 재사용성 체크리스트
- [ ] 컴포넌트 설계 가이드 문서화

---

## 🎯 기대 효과
- **코드 재사용률** 증가 (목표 40% → 70%)
- **새 페이지 개발 시간** 단축 (목표 50%)
- **컴포넌트 일관성**: 디자인 시스템 준수율 95%
- **유지보수성**: 중복 코드 감소, 타입 안정성 향상

---

## 부록: 주요 결정 체크리스트
- [ ] Vuetify API는 직접 채택하지 않았다 — 참조용으로만 사용
- [ ] shadcn/ui 기반으로 확장 네이밍 가이드 문서화
- [ ] coop-timer의 페이지 내부 로직은 우선 유지; 불가피하면 컴포넌트별 훅으로 분리
- [ ] CategorySection은 components/ 루트로 이동, 도메인 특화 여부 2주 모니터링
- [ ] 디자인 토큰 추출 및 AppShell 기반 UI 통일성 확보

---

**다음 단계**: 이 수정본을 팀과 리뷰하고 Phase 1에 따라 우선순위 작업을 시작하세요. 각 단계별로 PR 템플릿과 체크리스트(테스트 케이스 포함)를 만들어 리뷰 속도를 높이는 것을 권장합니다.
