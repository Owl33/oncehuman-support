"use client";

import React from "react";
import { Character } from "@/types/character";
import { CharacterSelectorSection } from "./sections/character-selector-section";
import { ItemSelectionSection } from "./sections/item-selection-section";
import { MaterialCalculationSection } from "./sections/material-calculation-section";

interface DetailLayoutProps {
  currentCharacter?: Character;
}

export function DetailLayout({ currentCharacter }: DetailLayoutProps) {
  if (!currentCharacter) {
    return <div>캐릭터를 선택해주세요</div>;
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
      {/* 왼쪽: 캐릭터 선택 및 아이템 선택 */}
      <div className="lg:col-span-2 space-y-6 order-1">
        <CharacterSelectorSection />
        <ItemSelectionSection currentCharacter={currentCharacter} />
      </div>

      {/* 오른쪽: 재료 계산 (모바일에서는 위로) */}
      <div className="lg:col-span-1 order-0 lg:order-1">
        <MaterialCalculationSection currentCharacter={currentCharacter} />
      </div>
    </div>
  );
}