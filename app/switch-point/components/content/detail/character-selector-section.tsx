"use client";

import React from "react";
import { CharacterSelector } from "../../character-selector";
import { useSwitchPointContext } from "../../../contexts/switch-point-context";

export function CharacterSelectorSection() {
  // Context에서 필요한 것만 가져오기 (단순하게)
  const { characters, selectedCharacterId, selectCharacter } = useSwitchPointContext();

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">캐릭터 선택</h2>
      <CharacterSelector
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        onSelect={selectCharacter}
      />
    </div>
  );
}