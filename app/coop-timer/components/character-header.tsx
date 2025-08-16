"use client";

import { BaseCharacter } from "@/types/character";
import { ScenarioType } from "@/types/coop-timer";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils";

interface CharacterHeaderProps {
  characters: BaseCharacter[];
  selectedCharacter: string | null;
  onCharacterSelect: (characterId: string) => void;
}

// 시나리오 정보 매핑
const SCENARIO_INFO = {
  "endless-dream": {
    name: "무한한 꿈",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "🌙"
  },
  "way-of-winter": {
    name: "혹독한 설산", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "❄️"
  },
  "manibus": {
    name: "터치 오브 스카이",
    color: "bg-sky-100 text-sky-800 border-sky-200", 
    icon: "☁️"
  },
  "prism-war": {
    name: "프리즘 전쟁",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    icon: "💎"
  },
  "evolution-call": {
    name: "진화의 부름",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "🧬"
  }
} as const;

export function CharacterHeader({
  characters,
  selectedCharacter,
  onCharacterSelect,
}: CharacterHeaderProps) {
  const selectedCharacterData = characters.find(c => c.id === selectedCharacter);
  const scenarioKey = selectedCharacterData?.scenario as ScenarioType | undefined;
  const scenarioInfo = scenarioKey ? SCENARIO_INFO[scenarioKey] : null;

  if (characters.length === 0) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center text-muted-foreground text-sm">
          캐릭터를 먼저 등록해주세요.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* 왼쪽: 캐릭터 선택 */}
        <div className="flex flex-wrap gap-2 flex-1">
          {characters.map((character) => {
            const isSelected = selectedCharacter === character.id;
            const characterScenario = character.scenario as ScenarioType | undefined;
            const characterScenarioInfo = characterScenario ? SCENARIO_INFO[characterScenario] : null;
            
            return (
              <Button
                key={character.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCharacterSelect(character.id)}
                className="h-8 px-3 text-sm max-w-[160px]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="truncate">{character.name}</span>
                  {characterScenarioInfo && (
                    <span className="text-xs opacity-70 flex-shrink-0">
                      {characterScenarioInfo.icon}
                    </span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {/* 오른쪽: 시나리오 및 캐릭터 정보 */}
        {selectedCharacterData && scenarioInfo && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge 
              variant="secondary" 
              className={cn("gap-1 text-xs", scenarioInfo.color)}
            >
              <span>{scenarioInfo.icon}</span>
              <span>{scenarioInfo.name}</span>
            </Badge>
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span>{selectedCharacterData.job}</span>
              <span>•</span>
              <span>{selectedCharacterData.server}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}