// types/switchpoint.ts

// 카테고리 정의
export type ItemCategory =
  | "storage"
  | "production_processing"
  | "functional"
  | "weapon"
  | "infection";

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  storage: "저장 시설",
  production_processing: "생산 가공",
  functional: "기능 시설",
  weapon: "무기",
  infection: "감염물",
};

// JSON에서 사용하는 카테고리와 매핑
export const JSON_CATEGORY_MAP: Record<string, ItemCategory> = {
  storage: "storage",
  production_processing: "production_processing",
  functional: "functional",
  weapon: "weapon",
  infection: "infection",
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

// 캐릭터 데이터
export interface CharacterData {
  id: string;
  name: string;
  selectedItems: Record<string, number>; // itemId -> 제작 개수
  ownedMaterials: Record<string, number>; // materialId -> 보유 개수
  lastUpdated: string;
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
export type ViewMode = "dashboard" | "detail";

// 사용자 설정
export interface UserSettings {
  defaultView: ViewMode;
  lastSelectedCharacter?: string;
}
