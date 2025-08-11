import { useMemo } from "react";
import { Item, Material } from "@/types/character";

// 정적 데이터 import
import itemsData from "../data/items-list.json";
import materialsData from "../data/materials-list.json";

/**
 * 게임 데이터 (아이템, 재료) 중앙 관리 훅
 * 여러 컴포넌트에서 동일한 데이터를 중복 로딩하지 않도록 함
 */
export function useGameData() {
  const items = useMemo(() => itemsData as Item[], []);
  const materials = useMemo(() => materialsData as Material[], []);

  return {
    items,
    materials,
  };
}