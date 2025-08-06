// hooks/use-switchpoint.ts
import { useState, useEffect, useCallback, useMemo } from "react";
// import { storage } from '@/lib/storage/switchpoint-storage';
import { calculateMaterials, calculateCharacterSummary } from "../lib/switchpoint/calculations";
import {
  CharacterData,
  Item,
  Material,
  ViewMode,
  UserSettings,
  ItemCategory,
  JSON_CATEGORY_MAP,
} from "../types/switchpoint";
import itemsData from "../data/items-list.json";
import materialsData from "../data/materials-list.json";

// 테스트용 로컬 데이터
const LOCAL_TEST_DATA: CharacterData[] = [
  {
    id: `character_1`,
    name: `캐릭터 1`,
    selectedItems: {
      water_pump: 2,
      growing_box: 5,
    },
    ownedMaterials: {
      steel_ingot: 10,
      log: 50,
      gravel: 100,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: `character_2`,
    name: `캐릭터 2`,
    selectedItems: {
      water_pump: 2,
      growing_box: 5,
    },
    ownedMaterials: {
      steel_ingot: 10,
      log: 50,
      gravel: 100,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: `character_3`,
    name: `캐릭터 3`,
    selectedItems: {
      water_pump: 2,
      growing_box: 5,
    },
    ownedMaterials: {
      steel_ingot: 10,
      log: 50,
      gravel: 100,
    },
    lastUpdated: new Date().toISOString(),
  },
];

export function useSwitchPoint() {
  // 데이터
  const items = useMemo(() => itemsData as Item[], []);
  const materials = useMemo(() => materialsData as Material[], []);

  // 상태 - 로컬 테스트 데이터 사용
  const [characters, setCharacters] = useState<CharacterData[]>(LOCAL_TEST_DATA);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("character_1");
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [settings, setSettings] = useState<UserSettings>({ defaultView: "dashboard" });
  const [loading, setLoading] = useState(false); // 테스트용이므로 false
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
      production_processing: [],
      functional: [],

      weapon: [],
      infection: [],
    };

    items.forEach((item) => {
      const mappedCategory = JSON_CATEGORY_MAP[item.category] || "facility";
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
      currentCharacter.selectedItems,
      currentCharacter.ownedMaterials,
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

  // 초기 로드 - 실제 구현 시 주석 해제
  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       setLoading(true);
  //
  //       // 캐릭터 목록 로드
  //       let loadedCharacters = await storage.getCharacterList();
  //       if (loadedCharacters.length === 0) {
  //         // 기본 캐릭터 생성
  //         for (const char of DEFAULT_CHARACTERS) {
  //           await storage.saveCharacterData(char.id, char);
  //         }
  //         loadedCharacters = DEFAULT_CHARACTERS;
  //       }
  //       setCharacters(loadedCharacters);
  //
  //       // 설정 로드
  //       const loadedSettings = await storage.getUserSettings();
  //       setSettings(loadedSettings);
  //       setViewMode(loadedSettings.defaultView);
  //
  //       // 마지막 선택 캐릭터 설정
  //       if (loadedSettings.lastSelectedCharacter) {
  //         setSelectedCharacterId(loadedSettings.lastSelectedCharacter);
  //       } else if (loadedCharacters.length > 0) {
  //         setSelectedCharacterId(loadedCharacters[0].id);
  //       }
  //     } catch (error) {
  //       console.error('Failed to load data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //   loadData();
  // }, []);

  // 아이템 수량 업데이트
  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!currentCharacter) return;

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

      // 실제 저장 - 주석 처리
      // await storage.saveCharacterData(currentCharacter.id, updatedCharacter);

      // 로컬 상태만 업데이트
      setCharacters((prev) =>
        prev.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c))
      );
    },
    [currentCharacter]
  );

  // 재료 보유량 업데이트
  const updateMaterialOwned = useCallback(
    async (materialId: string, quantity: number) => {
      if (!currentCharacter) return;

      const updatedCharacter = {
        ...currentCharacter,
        ownedMaterials: {
          ...currentCharacter.ownedMaterials,
          [materialId]: Math.max(0, quantity),
        },
        lastUpdated: new Date().toISOString(),
      };

      // 실제 저장 - 주석 처리
      // await storage.saveCharacterData(currentCharacter.id, updatedCharacter);

      // 로컬 상태만 업데이트
      setCharacters((prev) =>
        prev.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c))
      );
    },
    [currentCharacter]
  );

  // 캐릭터 선택
  const selectCharacter = useCallback(
    async (characterId: string) => {
      setSelectedCharacterId(characterId);

      // 설정 업데이트 - 주석 처리
      // const updatedSettings = {
      //   ...settings,
      //   lastSelectedCharacter: characterId,
      // };
      // await storage.saveUserSettings(updatedSettings);
      // setSettings(updatedSettings);
    },
    [settings]
  );

  // 뷰 모드 변경
  const changeViewMode = useCallback(
    async (mode: ViewMode) => {
      setViewMode(mode);

      // 설정 업데이트 - 주석 처리
      // const updatedSettings = {
      //   ...settings,
      //   defaultView: mode,
      // };
      // await storage.saveUserSettings(updatedSettings);
      // setSettings(updatedSettings);
    },
    [settings]
  );

  // 모든 아이템 초기화
  const resetAllItems = useCallback(async () => {
    if (!currentCharacter) return;

    const updatedCharacter = {
      ...currentCharacter,
      selectedItems: {},
      lastUpdated: new Date().toISOString(),
    };

    // 실제 저장 - 주석 처리
    // await storage.saveCharacterData(currentCharacter.id, updatedCharacter);

    // 로컬 상태만 업데이트
    setCharacters((prev) => prev.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)));
  }, [currentCharacter]);

  // 모든 재료 초기화
  const resetAllMaterials = useCallback(async () => {
    if (!currentCharacter) return;

    const updatedCharacter = {
      ...currentCharacter,
      ownedMaterials: {},
      lastUpdated: new Date().toISOString(),
    };

    // 실제 저장 - 주석 처리
    // await storage.saveCharacterData(currentCharacter.id, updatedCharacter);

    // 로컬 상태만 업데이트
    setCharacters((prev) => prev.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)));
  }, [currentCharacter]);

  // 테스트용 export/import 함수
  const exportData = async () => {
    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      characters,
      settings,
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importData = async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.characters) {
        setCharacters(data.characters);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  };

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

    // 스토리지 액션
    exportData,
    importData,
  };
}
