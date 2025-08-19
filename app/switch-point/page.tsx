"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Character, ViewMode } from "@/types/character";
import { characterStorage } from "@/lib/storage/character-storage";
import { useGameData } from "./hooks/use-game-data";
import { calculateCharacterSummary } from "./lib/switchpoint/calculations";
import { PageLayout } from "@/components/layout/page-layout";
import { PageLoading } from "@/components/states/page-loading";
import { SwitchPointHeader } from "./components/switch-point-header";
import { CharacterDashboard } from "./components/character-dashboard";
import { DetailLayout } from "./components/detail-layout";
import { EmptyCharactersState } from "./components/shared/empty-characters-state";
import { toast } from "sonner";

export default function SwitchPointPage() {
  // 페이지 상태 (coop-timer 스타일)
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [loading, setLoading] = useState(true);
  
  // 게임 데이터
  const { items, materials } = useGameData();
  
  // 현재 선택된 캐릭터
  const currentCharacter = useMemo(
    () => characters.find(c => c.id === selectedCharacterId),
    [characters, selectedCharacterId]
  );
  
  // 대시보드용 캐릭터 요약 데이터
  const characterSummaries = useMemo(() => {
    return characters.map(character => ({
      ...character,
      summary: calculateCharacterSummary(
        {
          selectedItems: character.selectedItems || {},
          ownedMaterials: character.ownedMaterials || {},
        },
        items,
        materials
      ),
    }));
  }, [characters, items, materials]);

  // 캐릭터 데이터 로드
  const loadCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const loadedCharacters = await characterStorage.getCharacters();
      setCharacters(loadedCharacters);

      // 선택된 캐릭터가 없거나 삭제된 경우 첫 번째 캐릭터 선택
      const currentExists = loadedCharacters.some(c => c.id === selectedCharacterId);
      if (!currentExists && loadedCharacters.length > 0) {
        setSelectedCharacterId(loadedCharacters[0].id);
      } else if (loadedCharacters.length === 0) {
        setSelectedCharacterId("");
      }
    } catch (error) {
      console.error("Failed to load characters:", error);
      toast.error("캐릭터 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [selectedCharacterId]);

  // 초기 로드
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // 캐릭터 선택
  const handleCharacterSelect = useCallback((characterId: string) => {
    setSelectedCharacterId(characterId);
  }, []);

  // 뷰 모드 변경
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // 아이템 상태 업데이트
  const updateCharacterItems = useCallback(async (characterId: string, selectedItems: Record<string, number>) => {
    try {
      await characterStorage.updateSwitchPointData(characterId, { selectedItems });
      
      setCharacters(prev => 
        prev.map(char => 
          char.id === characterId 
            ? { ...char, selectedItems }
            : char
        )
      );
    } catch (error) {
      console.error("Failed to update character items:", error);
      toast.error("아이템 상태 업데이트에 실패했습니다.");
    }
  }, []);

  // 재료 상태 업데이트
  const updateCharacterMaterials = useCallback(async (characterId: string, ownedMaterials: Record<string, number>) => {
    try {
      await characterStorage.updateSwitchPointData(characterId, { ownedMaterials });
      
      setCharacters(prev => 
        prev.map(char => 
          char.id === characterId 
            ? { ...char, ownedMaterials }
            : char
        )
      );
    } catch (error) {
      console.error("Failed to update character materials:", error);
      toast.error("재료 상태 업데이트에 실패했습니다.");
    }
  }, []);

  // 데이터 내보내기
  const exportData = useCallback(async (): Promise<string> => {
    return await characterStorage.exportData();
  }, []);

  // 데이터 가져오기
  const importData = useCallback(async (jsonData: string): Promise<void> => {
    await characterStorage.importData(jsonData);
    await loadCharacters();
    toast.success("데이터를 성공적으로 가져왔습니다.");
  }, [loadCharacters]);

  if (loading) {
    return <PageLoading message="데이터를 불러오는 중..." />;
  }

  if (characters.length === 0) {
    return (
      <PageLayout>
        <SwitchPointHeader
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onExportData={exportData}
          onImportData={importData}
        />
        <EmptyCharactersState />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SwitchPointHeader
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onExportData={exportData}
        onImportData={importData}
      />
      
      <div className="space-y-6">
        {viewMode === "dashboard" ? (
          <CharacterDashboard
            characterSummaries={characterSummaries}
            onSelectCharacter={handleCharacterSelect}
            onChangeViewMode={handleViewModeChange}
          />
        ) : (
          <DetailLayout
            characters={characters}
            selectedCharacterId={selectedCharacterId}
            currentCharacter={currentCharacter}
            onSelectCharacter={handleCharacterSelect}
            onUpdateItems={updateCharacterItems}
            onUpdateMaterials={updateCharacterMaterials}
          />
        )}
      </div>
    </PageLayout>
  );
}
