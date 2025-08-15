"use client";

import { useEffect, useState } from "react";
import { BaseCharacter } from "@/types/character";
import { characterStorage } from "@/lib/storage/character-storage";
import { useCoopTimer } from "./hooks/use-coop-timer";
import { PageLayout } from "@/components/layout/page-layout";
import { CoopTimerHeader } from "./components/coop-timer-header";
import { CharacterSelectorCard } from "./components/character-selector-card";
import { EventListCard } from "./components/event-list-card";
import { EmptyCharacterState } from "./components/empty-character-state";
import { NoCharacterSelected } from "./components/no-character-selected";
import { DebugProgress } from "./components/debug-progress";

export default function CoopTimerPage() {
  const [characters, setCharacters] = useState<BaseCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  
  const {
    events,
    progress,
    setSelectedCharacters,
    completeEvent,
    uncompleteEvent,
    getEventStatus,
  } = useCoopTimer();

  // Load characters
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const loadedCharacters = await characterStorage.getCharacters();
        setCharacters(loadedCharacters);
        
        // Auto-select first character
        if (loadedCharacters.length > 0 && !selectedCharacter) {
          setSelectedCharacter(loadedCharacters[0].id);
          setSelectedCharacters([loadedCharacters[0].id]);
        }
      } catch (error) {
        console.error("Failed to load characters:", error);
      }
    };
    
    loadCharacters();
  }, [selectedCharacter, setSelectedCharacters]);

  // Character selection handler
  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
    setSelectedCharacters([characterId]);
  };

  // Event toggle handler
  const handleEventToggle = (eventId: string, completed: boolean) => {
    if (!selectedCharacter) return;
    
    if (completed) {
      completeEvent(selectedCharacter, eventId);
    } else {
      uncompleteEvent(selectedCharacter, eventId);
    }
  };

  // Empty state
  if (characters.length === 0) {
    return (
      <PageLayout>
        <CoopTimerHeader />
        <EmptyCharacterState />
      </PageLayout>
    );
  }

  // Selected character data
  const selectedCharacterData = characters.find(c => c.id === selectedCharacter);

  return (
    <PageLayout>
      <CoopTimerHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Character Selector */}
        <div className="lg:col-span-1">
          <CharacterSelectorCard
            characters={characters}
            selectedCharacter={selectedCharacter}
            onCharacterSelect={handleCharacterSelect}
          />
        </div>

        {/* Event List */}
        <div className="lg:col-span-2">
          {!selectedCharacterData ? (
            <NoCharacterSelected />
          ) : (
            <EventListCard
              character={selectedCharacterData}
              events={events}
              progress={progress}
              onEventToggle={handleEventToggle}
              getEventStatus={getEventStatus}
            />
          )}
        </div>
      </div>

      {/* Debug component */}
      <DebugProgress 
        progress={progress} 
        selectedCharacterId={selectedCharacter || undefined}
      />
    </PageLayout>
  );
}