"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Character, Item, Material, ItemCategory } from "@/types/character";
import { characterStorage } from "@/lib/storage/character-storage";
import { CategoryTabs } from "../../category-tabs";
import { ItemGrid } from "../../item-grid";
import { useSwitchPointContext } from "../../../contexts/switch-point-context";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/base/alert-dialog";

// 정적 데이터 import
import itemsData from "../../../data/items-list.json";
import materialsData from "../../../data/materials-list.json";

interface ItemSelectionSectionProps {
  currentCharacter: Character;
}

export function ItemSelectionSection({ currentCharacter }: ItemSelectionSectionProps) {
  // Context에서 필요한 것만 가져오기
  const { reloadCharacters } = useSwitchPointContext();

  // 로컬 상태
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>("storage");
  const [showResetDialog, setShowResetDialog] = useState(false);

  // 정적 데이터
  const items = useMemo(() => itemsData as Item[], []);
  const materials = useMemo(() => materialsData as Material[], []);

  // 카테고리별 아이템 필터링
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

    items.forEach(item => {
      if (categorized[item.category as ItemCategory]) {
        categorized[item.category as ItemCategory].push(item);
      }
    });

    return categorized;
  }, [items]);

  // 현재 카테고리의 아이템들
  const currentItems = itemsByCategory[selectedCategory] || [];

  // 아이템 수량 업데이트 로직
  const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
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
        await reloadCharacters(); // Context의 characters 다시 로드
      }
    } catch (error) {
      console.error("Failed to update item quantity:", error);
      toast.error("아이템 수량 업데이트에 실패했습니다.");
    }
  }, [currentCharacter, reloadCharacters]);

  // 모든 아이템 초기화
  const resetAllItems = useCallback(async () => {
    try {
      const updated = await characterStorage.updateSwitchPointData(currentCharacter.id, {
        selectedItems: {},
      });

      if (updated) {
        await reloadCharacters();
        toast.success("모든 아이템을 초기화했습니다.");
      }
    } catch (error) {
      console.error("Failed to reset items:", error);
      toast.error("아이템 초기화에 실패했습니다.");
    }
  }, [currentCharacter, reloadCharacters]);

  // 초기화 다이얼로그 핸들러
  const handleResetClick = () => {
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    resetAllItems();
    setShowResetDialog(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">아이템 선택</h2>
      
      <CategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <ItemGrid
        items={currentItems}
        materials={materials}
        selectedItems={currentCharacter.selectedItems || {}}
        onUpdateQuantity={updateItemQuantity}
        onResetClick={handleResetClick}
      />

      {/* 아이템 초기화 확인 다이얼로그 */}
      <AlertDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>모든 아이템을 초기화하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 모든 아이템이 초기화됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              초기화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}