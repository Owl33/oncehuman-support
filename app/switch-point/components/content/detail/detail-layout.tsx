"use client";

import React from "react";
import { Character } from "@/types/character";
import { CharacterSelectorSection } from "./character-selector-section";
import { ItemSelectionSection } from "./item-selection-section";
import { MaterialCalculationSection } from "./material-calculation-section";

interface DetailLayoutProps {
  currentCharacter?: Character;
}

export function DetailLayout({ currentCharacter }: DetailLayoutProps) {
  if (!currentCharacter) {
    return <div>캐릭터를 선택해주세요</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 왼쪽: 캐릭터 선택 및 아이템 선택 */}
      <div className="lg:col-span-2 space-y-6">
        <CharacterSelectorSection />
        <ItemSelectionSection currentCharacter={currentCharacter} />
      </div>

      {/* 오른쪽: 재료 계산 */}
      <div className="lg:col-span-1">
        <MaterialCalculationSection currentCharacter={currentCharacter} />
      </div>
    </div>
  );
}