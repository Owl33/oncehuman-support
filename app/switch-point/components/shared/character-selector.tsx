// app/switchpoint/components/character-selector.tsx
"use client";

import { Character } from "@/types/character";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { Button } from "@/components/base/button";
interface CharacterSelectorProps {
  characters: Character[];
  selectedCharacterId: string;
  onSelect: (characterId: string) => void;
}

export function CharacterSelector({
  characters,
  selectedCharacterId,
  onSelect,
}: CharacterSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {characters.map((character) => (
        <Button
          variant={selectedCharacterId === character.id ? "default" : "ghost"}
          key={character.id}
          onClick={() => onSelect(character.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
            "hover:shadow-md hover:scale-105"
          )}>
          <User className="h-4 w-4" />
          <span className="">{character.name}</span>
        </Button>
      ))}
    </div>
  );
}
