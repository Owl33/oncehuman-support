"use client";

import { Character } from "@/types/character";
import { SmartSelect } from "@/components/ui";
import { Users } from "lucide-react";

interface CharacterSelectorProps {
  characters: Character[];
  selectedCharacterId: string;
  onSelect: (characterId: string) => void;
}

const SCENARIO_INFO = {
  "터치 오브 스카이": {
    name: "터치 오브 스카이",
    color: "bg-sky-100 text-sky-800",
    icon: "☁️",
  },
  "무한한 꿈": {
    name: "무한한 꿈",
    color: "bg-purple-100 text-purple-800",
    icon: "🌙",
  },
  "혹독한 설산": {
    name: "혹독한 설산",
    color: "bg-blue-100 text-blue-800",
    icon: "❄️",
  },
  "프리즘 전쟁": {
    name: "프리즘 전쟁",
    color: "bg-pink-100 text-pink-800",
    icon: "💎",
  },
  "진화의 부름": {
    name: "진화의 부름",
    color: "bg-green-100 text-green-800",
    icon: "🧬",
  },
} as const;

/**
 * 캐릭터 렌더링 함수 (coop-timer 스타일)
 */
const renderCharacter = (character: Character) => {
  const scenarioKey = character.scenario as keyof typeof SCENARIO_INFO | undefined;
  const scenarioInfo = scenarioKey ? SCENARIO_INFO[scenarioKey] : null;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-medium truncate">{character.name}</span>
      {scenarioInfo && (
        <span className="text-xs text-muted-foreground/70 flex-shrink-0">
          {scenarioInfo.icon} {scenarioInfo.name}
        </span>
      )}
      {character.job && (
        <span className="text-xs text-muted-foreground truncate">({character.job})</span>
      )}
    </div>
  );
};

export function CharacterSelector({
  characters,
  selectedCharacterId,
  onSelect,
}: CharacterSelectorProps) {
  // SmartSelect onChange 타입 호환을 위한 래퍼 함수
  const handleChange = (value: string | string[]) => {
    // 단일 선택이므로 string만 처리
    if (typeof value === "string") {
      onSelect(value);
    }
  };

  return (
    <SmartSelect
      items={characters}
      value={selectedCharacterId}
      onChange={handleChange}
      itemText="name"
      itemValue="id"
      renderSelected={renderCharacter}
      renderOption={renderCharacter}
      label="캐릭터 선택"
      placeholder="캐릭터를 선택하세요"
      prependIcon={Users}
      className="w-full"
    />
  );
}
