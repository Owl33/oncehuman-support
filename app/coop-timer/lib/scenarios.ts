// 시나리오 정의 및 데이터 관리
import { ScenarioType, Scenario, CoopEvent, GameMode, EventScope } from "@/types/coop-timer";

export const SCENARIOS: Record<ScenarioType, Scenario> = {
  [ScenarioType.COMMON]: {
    id: ScenarioType.COMMON,
    name: "공통",
    description: "모든 시나리오에서 공유되는 이벤트"
  },
  [ScenarioType.ENDLESS_DREAM]: {
    id: ScenarioType.ENDLESS_DREAM,
    name: "무한한 꿈",
    description: "터치 오브 스카이와 혹독한 설산의 모든 이벤트를 포함하는 통합 시나리오"
  },
  [ScenarioType.WAY_OF_WINTER]: {
    id: ScenarioType.WAY_OF_WINTER,
    name: "혹독한 설산",
    description: "극한의 추위 속에서 펼쳐지는 도전"
  },
  [ScenarioType.MANIBUS]: {
    id: ScenarioType.MANIBUS,
    name: "터치 오브 스카이",
    description: "하늘을 향한 모험의 시나리오"
  },
  [ScenarioType.PRISM_WAR]: {
    id: ScenarioType.PRISM_WAR,
    name: "프리즘 전쟁",
    description: "프리즘을 둘러싼 치열한 전투"
  },
  [ScenarioType.EVOLUTION_CALL]: {
    id: ScenarioType.EVOLUTION_CALL,
    name: "진화의 부름",
    description: "새로운 진화를 향한 여정"
  }
};

// 시나리오 설정 타입
interface ScenarioConfig {
  gameMode: GameMode;
  inherits: ScenarioType[];
}

// 시나리오 설정 (게임 모드 및 상속 관계)
const SCENARIO_CONFIG: Record<ScenarioType, ScenarioConfig> = {
  [ScenarioType.COMMON]: { 
    gameMode: GameMode.PVE, 
    inherits: [] 
  },
  [ScenarioType.MANIBUS]: { 
    gameMode: GameMode.PVE, 
    inherits: [] 
  },
  [ScenarioType.WAY_OF_WINTER]: { 
    gameMode: GameMode.PVE, 
    inherits: [] 
  },
  [ScenarioType.ENDLESS_DREAM]: { 
    gameMode: GameMode.PVE, 
    inherits: [ScenarioType.MANIBUS, ScenarioType.WAY_OF_WINTER] 
  },
  [ScenarioType.PRISM_WAR]: { 
    gameMode: GameMode.PVP, 
    inherits: [] 
  },
  [ScenarioType.EVOLUTION_CALL]: { 
    gameMode: GameMode.PVE, 
    inherits: [] 
  }
};

// 시나리오별 이벤트 필터링 함수
export function getEventsForScenario(events: CoopEvent[], targetScenario: ScenarioType): CoopEvent[] {
  const config = SCENARIO_CONFIG[targetScenario];
  if (!config) {
    console.warn(`Unknown scenario: ${targetScenario}`);
    return [];
  }
  
  const allowedScenarios = [targetScenario, ...config.inherits];
  
  return events.filter(event => {
    // 1. 게임 모드가 맞아야 함
    if (event.gameMode !== config.gameMode) return false;
    
    // 2. 시나리오가 포함되어야 함  
    if (!allowedScenarios.includes(event.scenario)) return false;
    
    // 3. scope 체크: common은 모든 같은 게임모드에서, exclusive는 해당 시나리오에서만
    if (event.scope === EventScope.EXCLUSIVE && event.scenario !== targetScenario) {
      // exclusive 이벤트는 상속 시나리오에서만 허용
      return config.inherits.includes(event.scenario);
    }
    
    return true;
  });
}

// 시나리오 정보 조회
export function getScenario(scenarioType: ScenarioType): Scenario {
  return SCENARIOS[scenarioType];
}

// 모든 시나리오 목록
export function getAllScenarios(): Scenario[] {
  return Object.values(SCENARIOS);
}

// 게임 모드별 시나리오 목록
export function getScenariosByGameMode(gameMode: GameMode): Scenario[] {
  return Object.entries(SCENARIO_CONFIG)
    .filter(([_, config]) => config.gameMode === gameMode)
    .map(([scenarioType]) => SCENARIOS[scenarioType as ScenarioType]);
}

// 시나리오의 게임모드 반환
export function getScenarioGameMode(scenarioType: ScenarioType): GameMode {
  const config = SCENARIO_CONFIG[scenarioType];
  if (!config) {
    console.warn(`Unknown scenario: ${scenarioType}, defaulting to PvE`);
    return GameMode.PVE;
  }
  return config.gameMode;
}