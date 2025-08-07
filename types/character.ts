// types/character.ts

// 기본 캐릭터 정보 (캐릭터 관리 페이지용)
export interface BaseCharacter {
  id: string;
  name: string;
  scenario: string;
  server: string;
  job: string;
  desc?: string;
}

// SwitchPoint 데이터가 포함된 캐릭터 (전체 데이터)
export interface Character extends BaseCharacter {
  // SwitchPoint 관련 데이터 (옵셔널로 변경)
  selectedItems?: Record<string, number>; // itemId -> 제작 개수
  ownedMaterials?: Record<string, number>; // materialId -> 보유 개수
  lastUpdated: string;
}

// 캐릭터 생성 시 사용할 타입
export type CreateCharacterInput = Omit<BaseCharacter, 'id'> & {
  id?: string;
};

// 캐릭터 업데이트 시 사용할 타입
export type UpdateCharacterInput = Partial<Character> & {
  id: string;
};

// SwitchPoint 관련 타입들 (기존 switchpoint-types.ts에서 이동)
export type ItemCategory =
  | "storage"
  | "production"
  | "processing"
  | "functional"
  | "vehicle"
  | "weapon"
  | "infection";
  
export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  storage: "저장 시설",
  production: "생산 시설",
  processing: "가공 시설",
  functional: "기능 시설",
  vehicle: "차량",
  weapon: "무기",
  infection: "감염물",
};



// 재료 인터페이스
export interface Material {
  id: string;
  name: string;
  point: number;
  category: string;
}

// 아이템의 필요 재료
export interface ItemRequirement {
  id: string;
  stock: number; // 필요 개수
}

// 아이템 인터페이스
export interface Item {
  id: string;
  name: string;
  category: string;
  requiment: ItemRequirement[]; // JSON 오타 그대로 사용
}

// 계산된 재료 정보
export interface CalculatedMaterial {
  id: string;
  name: string;
  required: number; // 필요 개수
  owned: number; // 보유 개수
  needed: number; // 부족 개수
  points: number; // 필요 포인트
}

// 계산 결과
export interface CalculationResult {
  materials: CalculatedMaterial[];
  totalPoints: number;
}

// 뷰 모드
export type ViewMode = 'dashboard' | 'detail';