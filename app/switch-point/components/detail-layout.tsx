"use client";

import React from "react";
import { Character } from "@/types/character";
import { CharacterSelector } from "./shared/character-selector";
import { ItemSelection } from "./item-selection";
import { MaterialCalculation } from "./material-calculation";

interface DetailLayoutProps {
  characters: Character[];
  selectedCharacterId: string;
  currentCharacter?: Character;
  onSelectCharacter: (characterId: string) => void;
  onUpdateItems: (characterId: string, selectedItems: Record<string, number>) => Promise<void>;
  onUpdateMaterials: (characterId: string, ownedMaterials: Record<string, number>) => Promise<void>;
}

export function DetailLayout({ 
  characters,
  selectedCharacterId,
  currentCharacter,
  onSelectCharacter,
  onUpdateItems,
  onUpdateMaterials
}: DetailLayoutProps) {
  if (!currentCharacter) {
    return (
      <div className="space-y-6">
        <CharacterSelector
          characters={characters}
          selectedCharacterId={selectedCharacterId}
          onSelect={onSelectCharacter}
        />
        <div className="text-center py-8 text-muted-foreground">
          캐릭터를 선택해주세요
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 캐릭터 선택 */}
      <CharacterSelector
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        onSelect={onSelectCharacter}
      />

      {/* 메인 콘텐츠 - 밸런스 조정된 레이아웃 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* 왼쪽: 아이템 선택 */}
        <div className="xl:col-span-3">
          <ItemSelection
            currentCharacter={currentCharacter}
            onUpdateItems={onUpdateItems}
          />
        </div>

        {/* 오른쪽: 재료 계산 */}
        <div className="xl:col-span-2">
          <MaterialCalculation
            currentCharacter={currentCharacter}
            onUpdateMaterials={onUpdateMaterials}
          />
        </div>
      </div>
    </div>
  );
}