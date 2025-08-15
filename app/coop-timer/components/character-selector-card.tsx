"use client";

import { BaseCharacter } from "@/types/character";
import { Card } from "@/components/base/card";
import { Button } from "@/components/base/button";
import { Users, Server } from "lucide-react";

interface CharacterSelectorCardProps {
  characters: BaseCharacter[];
  selectedCharacter: string | null;
  onCharacterSelect: (characterId: string) => void;
}

export function CharacterSelectorCard({
  characters,
  selectedCharacter,
  onCharacterSelect,
}: CharacterSelectorCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="p-1.5 bg-blue-100 rounded-md">
          <Users className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="font-medium text-base text-gray-800">캐릭터</h3>
      </div>
      
      <div className="space-y-2">
        {characters.map(character => {
          const isSelected = selectedCharacter === character.id;
          return (
            <Button
              key={character.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onCharacterSelect(character.id)}
              className="w-full justify-start p-2 h-auto text-xs"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isSelected ? "bg-white" : "bg-blue-400"
                  }`} />
                  <div className="text-left">
                    <div className={`font-medium ${
                      isSelected ? "text-white" : "text-gray-700"
                    }`}>
                      {character.name}
                    </div>
                    <div className={`text-xs opacity-75 ${
                      isSelected ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {character.job}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs flex items-center space-x-1 opacity-60 ${
                    isSelected ? "text-blue-200" : "text-gray-400"
                  }`}>
                    <Server className="h-3 w-3" />
                    <span>{character.server}</span>
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}