"use client";

import { BaseCharacter } from "@/types/character";
import { ScenarioType } from "@/types/coop-timer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/base/select";
import { Badge } from "@/components/base/badge";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactCharacterSelectorProps {
  characters: BaseCharacter[];
  selectedCharacter: string | null;
  onCharacterSelect: (characterId: string) => void;
}

const SCENARIO_INFO = {
  common: {
    name: "공통",
    color: "bg-gray-100 text-gray-800",
    icon: "⚡",
  },
  "endless-dream": {
    name: "무한한 꿈",
    color: "bg-purple-100 text-purple-800",
    icon: "🌙",
  },
  "way-of-winter": {
    name: "혹독한 설산",
    color: "bg-blue-100 text-blue-800",
    icon: "❄️",
  },
  manibus: {
    name: "터치 오브 스카이",
    color: "bg-sky-100 text-sky-800",
    icon: "☁️",
  },
  "prism-war": {
    name: "프리즘 전쟁",
    color: "bg-pink-100 text-pink-800",
    icon: "💎",
  },
  "evolution-call": {
    name: "진화의 부름",
    color: "bg-green-100 text-green-800",
    icon: "🧬",
  },
} as const;

export function CompactCharacterSelector({
  characters,
  selectedCharacter,
  onCharacterSelect,
}: CompactCharacterSelectorProps) {
  const selectedCharacterData = characters.find((c) => c.id === selectedCharacter);
  const scenarioKey = selectedCharacterData?.scenario as ScenarioType | undefined;
  const scenarioInfo = scenarioKey ? SCENARIO_INFO[scenarioKey] : null;

  if (characters.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-700">캐릭터가 없습니다</h3>
          <p className="text-sm text-gray-500">먼저 캐릭터를 등록해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Character Selector */}
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            캐릭터 선택
          </label>
          <Select value={selectedCharacter || ""} onValueChange={onCharacterSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="캐릭터를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {characters.map((character) => {
                const characterScenario = character.scenario as ScenarioType | undefined;
                const characterScenarioInfo = characterScenario
                  ? SCENARIO_INFO[characterScenario]
                  : null;

                return (
                  <SelectItem key={character.id} value={character.id}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate">{character.name}</span>
                      {characterScenarioInfo && (
                        <span className="text-xs opacity-70 flex-shrink-0">
                          {characterScenarioInfo.icon}
                        </span>
                      )}
                      {character.server && (
                        <span className="text-xs text-gray-500 truncate">
                          ({character.server})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Character Info */}
        {selectedCharacterData && scenarioInfo && (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("gap-1 text-xs", scenarioInfo.color)}
            >
              <span>{scenarioInfo.icon}</span>
              <span>{scenarioInfo.name}</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Selected Character Details (Compact) */}
      {selectedCharacterData && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {selectedCharacterData.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-900">{selectedCharacterData.name}</span>
            {selectedCharacterData.server && (
              <span className="ml-2 text-gray-500">• {selectedCharacterData.server}</span>
            )}
            {selectedCharacterData.job && (
              <span className="ml-2 text-gray-500">• {selectedCharacterData.job}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}