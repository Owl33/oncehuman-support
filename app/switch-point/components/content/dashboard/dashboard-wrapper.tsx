"use client";

import React, { useMemo } from "react";
import { CharacterDashboard } from "./character-dashboard";
import { useSwitchPointContext } from "../../../contexts/switch-point-context";
import { calculateCharacterSummary } from "../../../lib/switchpoint/calculations";
import { useGameData } from "../../../hooks/use-game-data";

export function DashboardWrapper() {
  const { characters, selectCharacter, changeViewMode } = useSwitchPointContext();
  const { items, materials } = useGameData();

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