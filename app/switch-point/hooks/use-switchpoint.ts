// hooks/use-switchpoint.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { characterStorage } from '@/lib/storage/character-storage';
import { calculateMaterials, calculateCharacterSummary } from '../lib/switchpoint/calculations';
import { 
  Character,
  Item, 
  Material, 
  ViewMode,
  ItemCategory,
  JSON_CATEGORY_MAP
} from '@/types/character';
import itemsData from '../data/items-list.json';
import materialsData from '../data/materials-list.json';

export function useSwitchPoint() {
  // 데이터
  const items = useMemo(() => itemsData as Item[], []);
  const materials = useMemo(() => materialsData as Material[], []);
  
  // 상태
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('storage');
  
  // 현재 선택된 캐릭터
  const currentCharacter = useMemo(
    () => characters.find(c => c.id === selectedCharacterId),
    [characters, selectedCharacterId]
  );
  
  // 카테고리별 아이템
  const itemsByCategory = useMemo(() => {
    const categorized: Record<ItemCategory, Item[]> = {
      storage: [],
      outdoor: [],
      production: [],
      defence: [],
      facility: [],
      weapon: [],
      infection: [],
    };
    
    items.forEach(item => {
      const mappedCategory = JSON_CATEGORY_MAP[item.category] || 'facility';
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
  
  // 초기 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // localStorage에서 캐릭터 목록 로드
        const loadedCharacters = await characterStorage.getCharacters();
        setCharacters(loadedCharacters);
        
        // 캐릭터가 있으면 첫 번째 캐릭터 선택
        if (loadedCharacters.length > 0) {
          setSelectedCharacterId(loadedCharacters[0].id);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // 아이템 수량 업데이트
  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!currentCharacter) return;
    
    const updatedItems = {
      ...currentCharacter.selectedItems,
      [itemId]: Math.max(0, quantity),
    };
    
    // 0이면 제거
    if (quantity <= 0) {
      delete updatedItems[itemId];
    }
    
    // localStorage에 저장
    const updated = await characterStorage.updateSwitchPointData(currentCharacter.id, {
      selectedItems: updatedItems,
    });
    
    if (updated) {
      setCharacters(prev => 
        prev.map(c => c.id === currentCharacter.id ? updated : c)
      );
    }
  }, [currentCharacter]);
  
  // 재료 보유량 업데이트
  const updateMaterialOwned = useCallback(async (materialId: string, quantity: number) => {
    if (!currentCharacter) return;
    
    const updatedMaterials = {
      ...currentCharacter.ownedMaterials,
      [materialId]: Math.max(0, quantity),
    };
    
    // localStorage에 저장
    const updated = await characterStorage.updateSwitchPointData(currentCharacter.id, {
      ownedMaterials: updatedMaterials,
    });
    
    if (updated) {
      setCharacters(prev => 
        prev.map(c => c.id === currentCharacter.id ? updated : c)
      );
    }
  }, [currentCharacter]);
  
  // 캐릭터 선택
  const selectCharacter = useCallback((characterId: string) => {
    setSelectedCharacterId(characterId);
  }, []);
  
  // 뷰 모드 변경
  const changeViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);
  
  // 모든 아이템 초기화
  const resetAllItems = useCallback(async () => {
    if (!currentCharacter) return;
    
    const updated = await characterStorage.updateSwitchPointData(currentCharacter.id, {
      selectedItems: {},
    });
    
    if (updated) {
      setCharacters(prev => 
        prev.map(c => c.id === currentCharacter.id ? updated : c)
      );
    }
  }, [currentCharacter]);
  
  // 모든 재료 초기화
  const resetAllMaterials = useCallback(async () => {
    if (!currentCharacter) return;
    
    const updated = await characterStorage.updateSwitchPointData(currentCharacter.id, {
      ownedMaterials: {},
    });
    
    if (updated) {
      setCharacters(prev => 
        prev.map(c => c.id === currentCharacter.id ? updated : c)
      );
    }
  }, [currentCharacter]);
  
  // 데이터 내보내기/가져오기는 characterStorage 사용
  return {
    // 상태
    loading,
    viewMode,
    characters,
    
    // 대시보드용 props
    dashboardProps: {
      characterSummaries,
      selectCharacter,
      changeViewMode,
    },
    
    // 상세 편집용 props
    detailProps: {
      characters,
      currentCharacter,
      items: currentItems,
      materials,
      calculationResult,
      selectedCharacterId,
      selectedCategory,
      selectCharacter,
      setSelectedCategory,
      updateItemQuantity,
      updateMaterialOwned,
      resetAllItems,
      resetAllMaterials,
    },
    
    // 공통 액션
    changeViewMode,
    exportData: () => characterStorage.exportData(),
    importData: (data: string) => characterStorage.importData(data),
  };
}