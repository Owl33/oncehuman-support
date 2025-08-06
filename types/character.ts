//@/types/character.ts
export interface CharacterData {
  id: string;
  name: string;
  scenario: string;
  server: string;
  job: string;
  desc: string;
  lastUpdated: string;
  selectedItems?: Record<string, number>; // itemId -> 제작 개수
  ownedMaterials?: Record<string, number>; // materialId -> 보유 개수
}
