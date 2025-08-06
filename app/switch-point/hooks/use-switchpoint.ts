// hooks/use-switchpoint.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { unifiedStorage } from "@/lib/storage/character-storage";
import { calculateMaterials, calculateCharacterSummary } from "../lib/switchpoint/calculations";
import { CharacterData } from "@/types/character";

import {
  Item,
  Material,
  ViewMode,
  UserSettings,
  ItemCategory,
  JSON_CATEGORY_MAP,
} from "@/types/switchpoint";
import itemsData from "../data/items-list.json";
import materialsData from "../data/materials-list.json";

export function useSwitchPoint() {
  // 데이터
  const items = useMemo(() => itemsData as Item[], []);
  const materials = useMemo(() => materialsData as Material[], []);

  // 상태
  const [characters, setCharacters] = useState<CharacterData[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [settings, setSettings] = useState<UserSettings>({ defaultView: "dashboard" });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>("storage");

  // 현재 선택된 캐릭터
  const currentCharacter = useMemo(
    () => characters.find((c) => c.id === selectedCharacterId),
    [characters, selectedCharacterId]
  );

  // 카테고리별 아이템
  const itemsByCategory = useMemo(() => {
    const categorized: Record<ItemCategory, Item[]> = {
      storage: [],
      production: [],
      processing: [],
      functional: [],
      vehicle: [],
      weapon: [],
      infection: [],
    };

    items.forEach((item) => {
      const mappedCategory = JSON_CATEGORY_MAP[item.category] || "functional";
      if (categorized[mappedCategory as ItemCategory]) {
        categorized[mappedCategory as ItemCategory].push(item);
      }
    });

    return categorized;
  }, [items]);

  // 현재 카테고리의 아이템들
  const currentItems = itemsByCategory[selectedCategory] || [];

  // 계산 결과
  const calculationResult = useMemo(() => {
    if (!currentCharacter) return { materials: [], totalPoints: 0 };

    return calculateMaterials(
      currentCharacter.selectedItems || {},
      currentCharacter.ownedMaterials || {},
      items,
      materials
    );
  }, [currentCharacter, items, materials]);

  // 대시보드용 요약 정보
  const characterSummaries = useMemo(() => {
    return characters.map((character) => ({
      ...character,
      summary: calculateCharacterSummary(character, items, materials),
    }));
  }, [characters, items, materials]);

  // 초기 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 캐릭터 목록 로드
        const loadedCharacters = await unifiedStorage.getCharacterList();
        setCharacters(loadedCharacters);

        // 설정 로드
        const loadedSettings = await unifiedStorage.getUserSettings();
        setSettings(loadedSettings);
        setViewMode(loadedSettings.defaultView);

        // 마지막 선택 캐릭터 설정
        if (
          loadedSettings.lastSelectedCharacter &&
          loadedCharacters.some((c) => c.id === loadedSettings.lastSelectedCharacter)
        ) {
          setSelectedCharacterId(loadedSettings.lastSelectedCharacter);
        } else if (loadedCharacters.length > 0) {
          setSelectedCharacterId(loadedCharacters[0].id);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 캐릭터 목록 새로고침 (character 페이지에서 캐릭터 추가/수정 후)
  const refreshCharacters = useCallback(async () => {
    try {
      const loadedCharacters = await unifiedStorage.getCharacterList();
      setCharacters(loadedCharacters);

      // 현재 선택된 캐릭터가 삭제된 경우 처리
      if (selectedCharacterId && !loadedCharacters.some((c) => c.id === selectedCharacterId)) {
        if (loadedCharacters.length > 0) {
          setSelectedCharacterId(loadedCharacters[0].id);
        } else {
          setSelectedCharacterId("");
        }
      }
    } catch (error) {
      console.error("Failed to refresh characters:", error);
    }
  }, [selectedCharacterId]);

  // 아이템 수량 업데이트
  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!currentCharacter) return;

      try {
        const updatedCharacter = {
          ...currentCharacter,
          selectedItems: {
            ...currentCharacter.selectedItems,
            [itemId]: Math.max(0, quantity),
          },
          lastUpdated: new Date().toISOString(),
        };

        // 0이면 제거
        if (quantity <= 0) {
          delete updatedCharacter.selectedItems[itemId];
        }

        await unifiedStorage.saveCharacterData(currentCharacter.id, updatedCharacter);

        // 로컬 상태 업데이트
        setCharacters((prev) =>
          prev.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c))
        );
      } catch (error) {
        console.error("Failed to update item quantity:", error);
      }
    },
    [currentCharacter]
  );

  // 재료 보유량 업데이트
  const updateMaterialOwned = useCallback(
    async (materialId: string, quantity: number) => {
      if (!currentCharacter) return;

      try {
        const updatedCharacter = {
          ...currentCharacter,
          ownedMaterials: {
            ...currentCharacter.ownedMaterials,
            [materialId]: Math.max(0, quantity),
          },
          lastUpdated: new Date().toISOString(),
        };

        // 0이면 제거
        if (quantity <= 0) {
          delete updatedCharacter.ownedMaterials[materialId];
        }

        await unifiedStorage.saveCharacterData(currentCharacter.id, updatedCharacter);

        // 로컬 상태 업데이트
        setCharacters((prev) =>
          prev.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c))
        );
      } catch (error) {
        console.error("Failed to update material owned:", error);
      }
    },
    [currentCharacter]
  );

  // 캐릭터 선택
  const selectCharacter = useCallback(
    async (characterId: string) => {
      try {
        setSelectedCharacterId(characterId);

        // 설정 업데이트
        const updatedSettings = {
          ...settings,
          lastSelectedCharacter: characterId,
        };
        await unifiedStorage.saveUserSettings(updatedSettings);
        setSettings(updatedSettings);
      } catch (error) {
        console.error("Failed to select character:", error);
      }
    },
    [settings]
  );

  // 뷰 모드 변경
  const changeViewMode = useCallback(
    async (mode: ViewMode) => {
      try {
        setViewMode(mode);

        const updatedSettings = {
          ...settings,
          defaultView: mode,
        };
        await unifiedStorage.saveUserSettings(updatedSettings);
        setSettings(updatedSettings);
      } catch (error) {
        console.error("Failed to change view mode:", error);
      }
    },
    [settings]
  );

  // 모든 아이템 초기화
  const resetAllItems = useCallback(async () => {
    if (!currentCharacter) return;

    try {
      const updatedCharacter = {
        ...currentCharacter,
        selectedItems: {},
        lastUpdated: new Date().toISOString(),
      };

      await unifiedStorage.saveCharacterData(currentCharacter.id, updatedCharacter);

      // 로컬 상태 업데이트
      setCharacters((prev) =>
        prev.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c))
      );
    } catch (error) {
      console.error("Failed to reset all items:", error);
    }
  }, [currentCharacter]);

  // 모든 재료 초기화
  const resetAllMaterials = useCallback(async () => {
    if (!currentCharacter) return;

    try {
      const updatedCharacter = {
        ...currentCharacter,
        ownedMaterials: {},
        lastUpdated: new Date().toISOString(),
      };

      await unifiedStorage.saveCharacterData(currentCharacter.id, updatedCharacter);

      // 로컬 상태 업데이트
      setCharacters((prev) =>
        prev.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c))
      );
    } catch (error) {
      console.error("Failed to reset all materials:", error);
    }
  }, [currentCharacter]);

  // 데이터 내보내기
  const exportData = useCallback(async () => {
    try {
      return await unifiedStorage.exportData();
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  }, []);

  // 데이터 가져오기
  const importData = useCallback(
    async (jsonData: string) => {
      try {
        await unifiedStorage.importData(jsonData);
        await refreshCharacters(); // 캐릭터 목록 새로고침
      } catch (error) {
        console.error("Failed to import data:", error);
        throw error;
      }
    },
    [refreshCharacters]
  );

  return {
    // 데이터
    characters,
    currentCharacter,
    items: currentItems,
    materials,
    calculationResult,
    characterSummaries,

    // 상태
    loading,
    viewMode,
    selectedCharacterId,
    selectedCategory,

    // 액션
    selectCharacter,
    changeViewMode,
    updateItemQuantity,
    updateMaterialOwned,
    resetAllItems,
    resetAllMaterials,
    setSelectedCategory,
    refreshCharacters,

    // 스토리지 액션
    exportData,
    importData,
  };
}
