// app/switchpoint/components/character-detail.tsx
"use client";

import { Character, Item, Material, ItemCategory, CalculationResult } from "@/types/character";
import { CharacterSelector } from "./character-selector";
import { CategoryTabs } from "./category-tabs";
import { ItemGrid } from "./item-grid";
import { MaterialCalculator } from "./material-calculator";

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
import { useState } from "react";

interface CharacterDetailProps {
  characters: Character[];
  currentCharacter?: Character;
  items: Item[];
  materials: Material[];
  calculationResult: CalculationResult;
  selectedCharacterId: string;
  selectedCategory: ItemCategory;
  selectCharacter: (characterId: string) => void;
  setSelectedCategory: (category: ItemCategory) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateMaterialOwned: (materialId: string, quantity: number) => void;
  resetAllItems: () => void;
  resetAllMaterials: () => void;
}

export function CharacterDetail({
  characters,
  currentCharacter,
  items,
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
}: CharacterDetailProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetType, setResetType] = useState<"items" | "materials" | null>(null);
  console.log(materials);
  const handleReset = (type: "items" | "materials") => {
    setResetType(type);
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    if (resetType === "items") {
      resetAllItems();
    } else if (resetType === "materials") {
      resetAllMaterials();
    }
    setShowResetDialog(false);
    setResetType(null);
  };

  if (!currentCharacter) {
    return <div>캐릭터를 선택해주세요</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 왼쪽: 캐릭터 선택 및 아이템 선택 */}
      <div className="lg:col-span-2 space-y-6">
        {/* 캐릭터 선택 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">캐릭터 선택</h2>
          <CharacterSelector
            characters={characters}
            selectedCharacterId={selectedCharacterId}
            onSelect={selectCharacter}
          />
        </div>

        {/* 아이템 선택 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">아이템 선택</h2>
          {/* <Button
              variant="outline"
              size="sm"
              onClick={() => handleReset("items")}
              className="">
              <RotateCcw />
              모든 아이템 초기화
            </Button> */}
          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <ItemGrid
            items={items}
            materials={materials}
            selectedItems={currentCharacter.selectedItems || {}}
            onUpdateQuantity={updateItemQuantity}
            onResetClick={() => handleReset("items")}
          />
        </div>
      </div>

      {/* 오른쪽: 재료 계산 */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          {/* <div className="flex items-center justify-between mb-4"> */}
          <h2 className="text-lg font-semibold">재료 계산</h2>
          {/* <Button
              variant="outline"
              size="sm"
              onClick={() => handleReset("materials")}
              className="gap-2">
              <RotateCcw className="h-4 w-4" />
              보유 재료 초기화
            </Button> */}
          {/* </div> */}

          <MaterialCalculator
            materials={calculationResult.materials}
            totalPoints={calculationResult.totalPoints}
            ownedMaterials={currentCharacter.ownedMaterials || {}}
            onUpdateOwned={updateMaterialOwned}
            onResetClick={() => handleReset("materials")} // 이렇게 전달
          />
        </div>
      </div>

      {/* 초기화 확인 다이얼로그 */}
      <AlertDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 초기화하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {resetType === "items"
                ? "선택한 모든 아이템이 초기화됩니다. 이 작업은 되돌릴 수 없습니다."
                : "입력한 모든 보유 재료가 초기화됩니다. 이 작업은 되돌릴 수 없습니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>초기화</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
