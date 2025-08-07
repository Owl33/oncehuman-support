// app/switchpoint/components/character-selector.tsx
"use client";

import { Character } from '@/types/character';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

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
        <button
          key={character.id}
          onClick={() => onSelect(character.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
            "hover:shadow-md hover:scale-105",
            selectedCharacterId === character.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-primary/50"
          )}
        >
          <User className="h-4 w-4" />
          <span className="font-medium">{character.name}</span>
        </button>
      ))}
    </div>
  );
}