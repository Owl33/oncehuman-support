"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { Character, ViewMode } from "@/types/character";
import { characterStorage } from "@/lib/storage/character-storage";
import { toast } from "sonner";

interface SwitchPointContextType {
  // 공유 상태 (최소한만)
  characters: Character[];
  selectedCharacterId: string;
  viewMode: ViewMode;
  loading: boolean;

  // 공유 액션
  selectCharacter: (characterId: string) => void;
  changeViewMode: (mode: ViewMode) => void;
  reloadCharacters: () => Promise<void>;
  
  // 데이터 관리
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
}

const SwitchPointContext = createContext<SwitchPointContextType | undefined>(undefined);

interface SwitchPointProviderProps {
  children: ReactNode;
}

export function SwitchPointProvider({ children }: SwitchPointProviderProps) {
  // 최소한의 공유 상태만
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [loading, setLoading] = useState(true);

  // 캐릭터 데이터 로드
  const reloadCharacters = useCallback(async () => {
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
    reloadCharacters();
  }, [reloadCharacters]);

  // 캐릭터 선택
  const selectCharacter = useCallback((characterId: string) => {
    setSelectedCharacterId(characterId);
  }, []);

  // 뷰 모드 변경
  const changeViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  // 데이터 내보내기
  const exportData = useCallback(async (): Promise<string> => {
    return await characterStorage.exportData();
  }, []);

  // 데이터 가져오기
  const importData = useCallback(async (jsonData: string): Promise<void> => {
    await characterStorage.importData(jsonData);
    await reloadCharacters();
    toast.success("데이터를 성공적으로 가져왔습니다.");
  }, [reloadCharacters]);

  const contextValue: SwitchPointContextType = {
    // 상태
    characters,
    selectedCharacterId,
    viewMode,
    loading,

    // 액션
    selectCharacter,
    changeViewMode,
    reloadCharacters,
    exportData,
    importData,
  };

  return (
    <SwitchPointContext.Provider value={contextValue}>
      {children}
    </SwitchPointContext.Provider>
  );
}

export function useSwitchPointContext(): SwitchPointContextType {
  const context = useContext(SwitchPointContext);
  if (context === undefined) {
    throw new Error("useSwitchPointContext must be used within a SwitchPointProvider");
  }
  return context;
}