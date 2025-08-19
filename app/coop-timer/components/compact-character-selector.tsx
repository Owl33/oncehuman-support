"use client";

import { BaseCharacter } from "@/types/character";
import { ScenarioType } from "@/types/coop-timer";
import { SmartSelect } from "@/components/ui";
import { Users } from "lucide-react";
import { Filter, Clock, Calendar, Crown, Timer, CheckCircle2, Circle, Zap } from "lucide-react";
import { Button } from "@/components/base/button";
interface CompactCharacterSelectorProps {
  characters: BaseCharacter[];
  selectedCharacter: string | null;
  onCharacterSelect: (characterId: string) => void;
  className?: string;
  filterMode: "all" | "incomplete" | "completed";
  setFilterMode: (mode: "all" | "incomplete" | "completed") => void;
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

/**
 * 캐릭터 렌더링 함수
 */
const renderCharacter = (character: BaseCharacter) => {
  const scenarioKey = character.scenario as ScenarioType | undefined;
  const scenarioInfo = scenarioKey ? SCENARIO_INFO[scenarioKey] : null;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="font-medium truncate">{character.name}</span>
      {scenarioInfo && (
        <span className="text-xs text-muted-foreground/70 flex-shrink-0">{scenarioInfo.name}</span>
      )}
      {character.server && (
        <span className="text-xs text-muted-foreground truncate">({character.server})</span>
      )}
    </div>
  );
};

export function CompactCharacterSelector({
  characters,
  selectedCharacter,
  onCharacterSelect,
  className,
  filterMode,
  setFilterMode,
}: CompactCharacterSelectorProps) {
  // SmartSelect onChange 타입 호환을 위한 래퍼 함수
  const handleChange = (value: string | string[]) => {
    // 단일 선택이므로 string만 처리
    if (typeof value === "string") {
      onCharacterSelect(value);
    }
  };

  return (
    <div className="flex items-end ">
      <SmartSelect
        items={characters}
        value={selectedCharacter}
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
      {/* 필터 버튼 그룹 (전체 / 미완료 / 완료) */}
      <div className="ml-4 flex items-center gap-2">
        <Button
          variant={filterMode === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterMode("all")}
          className="h-8 px-3 text-xs">
          전체
        </Button>

        <Button
          variant={filterMode === "incomplete" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterMode("incomplete")}
          className="h-8 px-3 text-xs gap-1">
          <Circle className="w-3 h-3" />
          미완료
        </Button>

        <Button
          variant={filterMode === "completed" ? "default" : "ghost"}
          size="sm"
          onClick={() => setFilterMode("completed")}
          className="h-8 px-3 text-xs gap-1">
          <CheckCircle2 className="w-3 h-3" />
          완료
        </Button>
      </div>
    </div>
  );
}
