"use client";

import React, { useMemo } from "react";
import { CharacterDashboard } from "../../character-dashboard";
import { useSwitchPointContext } from "../../../contexts/switch-point-context";
import { calculateCharacterSummary } from "../../../lib/switchpoint/calculations";
import { Item, Material } from "@/types/character";

// 정적 데이터 import
import itemsData from "../../../data/items-list.json";
import materialsData from "../../../data/materials-list.json";

export function DashboardWrapper() {
  const { characters, selectCharacter, changeViewMode } = useSwitchPointContext();

  // 정적 데이터 
  const items = useMemo(() => itemsData as Item[], []);
  const materials = useMemo(() => materialsData as Material[], []);

  // 대시보드용 캐릭터 요약 데이터 계산
  const characterSummaries = useMemo(() => {
    return characters.map(character => ({
      ...character,
      summary: calculateCharacterSummary(
        {
          selectedItems: character.selectedItems || {},
          ownedMaterials: character.ownedMaterials || {},
        },
        items,
        materials
      ),
    }));
  }, [characters, items, materials]);

  return (
    <CharacterDashboard
      characterSummaries={characterSummaries}
      selectCharacter={selectCharacter}
      changeViewMode={changeViewMode}
    />
  );
}