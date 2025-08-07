// lib/switchpoint/calculations.ts
import { Item, Material, CalculatedMaterial, CalculationResult } from '@/types/character';

export function calculateMaterials(
  selectedItems: Record<string, number>, // itemId -> quantity
  ownedMaterials: Record<string, number>, // materialId -> owned quantity
  items: Item[],
  materials: Material[]
): CalculationResult {
  // 1. 선택된 아이템들의 필요 재료 합산
  const requiredMaterials: Record<string, number> = {};
  
  Object.entries(selectedItems).forEach(([itemId, quantity]) => {
    if (quantity <= 0) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    item.requiment.forEach(req => {
      requiredMaterials[req.id] = (requiredMaterials[req.id] || 0) + (req.stock * quantity);
    });
  });
  
  // 2. 계산된 재료 정보 생성
  const calculatedMaterials: CalculatedMaterial[] = [];
  let totalPoints = 0;
  
  Object.entries(requiredMaterials).forEach(([materialId, required]) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    const owned = ownedMaterials[materialId] || 0;
    const needed = Math.max(0, required - owned);
    const points = needed * material.point;
    
    calculatedMaterials.push({
      id: materialId,
      name: material.name,
      required,
      owned,
      needed,
      points,
    });
    
    totalPoints += points;
  });
  
  // 3. 포인트 높은 순으로 정렬
  calculatedMaterials.sort((a, b) => b.points - a.points);
  
  return {
    materials: calculatedMaterials,
    totalPoints,
  };
}

// 카테고리별 아이템 그룹화
export function groupItemsByCategory(items: Item[]): Record<string, Item[]> {
  return items.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Item[]>);
}

// 캐릭터별 총 포인트 계산 (대시보드용)
export function calculateCharacterSummary(
  characterData: {
    selectedItems: Record<string, number>;
    ownedMaterials: Record<string, number>;
  },
  items: Item[],
  materials: Material[]
): {
  totalPoints: number;
  topMissingMaterials: { name: string; points: number }[];
  totalSelectedItems: number;
} {
  const result = calculateMaterials(
    characterData.selectedItems,
    characterData.ownedMaterials,
    items,
    materials
  );
  
  const totalSelectedItems = Object.values(characterData.selectedItems)
    .reduce((sum, qty) => sum + qty, 0);
  
  const topMissingMaterials = result.materials
    .filter(m => m.points > 0)
    .slice(0, 3)
    .map(m => ({ name: m.name, points: m.points }));
  
  return {
    totalPoints: result.totalPoints,
    topMissingMaterials,
    totalSelectedItems,
  };
}