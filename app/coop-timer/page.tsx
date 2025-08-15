"use client";

import { useEffect, useState } from "react";
import { BaseCharacter } from "@/types/character";
import { ScenarioType } from "@/types/coop-timer";
import { characterStorage } from "@/lib/storage/character-storage";
import { useCoopTimer } from "./hooks/use-coop-timer";
import { PageLayout } from "@/components/layout/page-layout";
import { CoopTimerHeader } from "./components/coop-timer-header";
import { CharacterSelectorCard } from "./components/character-selector-card";
import { EventListCard } from "./components/event-list-card";
import { EmptyCharacterState } from "./components/empty-character-state";
import { NoCharacterSelected } from "./components/no-character-selected";
import { DebugProgress } from "./components/debug-progress";
import { ScrollArea } from "@/components/base/scroll-area";

export default function CoopTimerPage() {
  const [characters, setCharacters] = useState<BaseCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  
  // 선택된 캐릭터 데이터
  const selectedCharacterData = characters.find(c => c.id === selectedCharacter);
  
  // 선택된 캐릭터의 시나리오
  const selectedScenario = selectedCharacterData?.scenario as ScenarioType | undefined;
  
  const {
    events,
    eventGroups,
    progress,
    setSelectedCharacters,
    completeEvent,
    uncompleteEvent,
    getEventStatus,
  } = useCoopTimer(selectedScenario);

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


  return (
    <PageLayout>
      <CoopTimerHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
        {/* Character Selector */}
        <div className="lg:col-span-1">
          <CharacterSelectorCard
            characters={characters}
            selectedCharacter={selectedCharacter}
            onCharacterSelect={handleCharacterSelect}
          />
        </div>

        {/* Event Lists */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {!selectedCharacterData ? (
            <NoCharacterSelected />
          ) : eventGroups.length === 0 ? (
            <div className="text-center text-muted-foreground">
              선택된 캐릭터의 시나리오에 해당하는 이벤트가 없습니다.
            </div>
          ) : (
            <>
              {/* 주간 퀘스트 */}
              {eventGroups.map((group, index) => (
                <div key={group.type} className={`flex-1 ${index === 1 ? 'min-h-0' : ''}`}>
                  <div className="h-full">
                    {index === 1 ? (
                      /* 협동 이벤트는 ScrollArea 적용 */
                      <ScrollArea className="h-full">
                        <EventListCard
                          character={selectedCharacterData}
                          events={group.events}
                          progress={progress}
                          onEventToggle={handleEventToggle}
                          getEventStatus={getEventStatus}
                          title={group.title}
                        />
                      </ScrollArea>
                    ) : (
                      /* 주간 퀘스트는 일반 표시 */
                      <EventListCard
                        character={selectedCharacterData}
                        events={group.events}
                        progress={progress}
                        onEventToggle={handleEventToggle}
                        getEventStatus={getEventStatus}
                        title={group.title}
                      />
                    )}
                  </div>
                </div>
              ))}
            </>
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