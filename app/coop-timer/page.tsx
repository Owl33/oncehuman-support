"use client";

import { useEffect, useState } from "react";
import { BaseCharacter } from "@/types/character";
import { ScenarioType } from "@/types/coop-timer";
import { characterStorage } from "@/lib/storage/character-storage";
import { useCoopTimer } from "./hooks/use-coop-timer";
import { PageLayout } from "@/components/layout/page-layout";
import { CoopTimerHeader } from "./components/coop-timer-header";
import { CharacterHeader } from "./components/character-header";
import { ResponsiveEventLayout } from "./components/responsive-event-layout";
import { CharacterEmptyState } from "./components/character-empty-state";
import { PageLoading } from "@/components/states/page-loading";

export default function CoopTimerPage() {
  const [characters, setCharacters] = useState<BaseCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 선택된 캐릭터 데이터
  const selectedCharacterData = characters.find(c => c.id === selectedCharacter);
  
  // 선택된 캐릭터의 시나리오
  const selectedScenario = selectedCharacterData?.scenario as ScenarioType | undefined;
  
  const {
    loading: dataLoading,
    events,
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
        setLoading(true);
        const loadedCharacters = await characterStorage.getCharacters();
        setCharacters(loadedCharacters);
        
        // Auto-select first character
        if (loadedCharacters.length > 0 && !selectedCharacter) {
          setSelectedCharacter(loadedCharacters[0].id);
          setSelectedCharacters([loadedCharacters[0].id]);
        }
      } catch (error) {
        console.error("Failed to load characters:", error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return <PageLoading message="캐릭터 데이터를 불러오는 중..." />;
  }

  if (dataLoading) {
    return <PageLoading message="이벤트 데이터를 불러오는 중..." />;
  }

  if (characters.length === 0) {
    return (
      <PageLayout>
        <CoopTimerHeader />
        <CharacterEmptyState type="no-characters" />
      </PageLayout>
    );
  }

  if (!selectedCharacterData) {
    return (
      <PageLayout>
        <CoopTimerHeader />
        <div className="space-y-4">
          <CharacterHeader
            characters={characters}
            selectedCharacter={selectedCharacter}
            onCharacterSelect={handleCharacterSelect}
          />
          <CharacterEmptyState type="no-selection" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <CoopTimerHeader />
      
      <div className="space-y-4">
        {/* 새로운 캐릭터 헤더 */}
        <CharacterHeader
          characters={characters}
          selectedCharacter={selectedCharacter}
          onCharacterSelect={handleCharacterSelect}
        />

        {/* 반응형 이벤트 레이아웃 */}
        <ResponsiveEventLayout
          character={selectedCharacterData}
          events={events}
          progress={progress}
          onEventToggle={handleEventToggle}
          getEventStatus={getEventStatus}
        />
      </div>

    </PageLayout>
  );
}