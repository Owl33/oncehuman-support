"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Character, CalculationResult } from "@/types/character";
import { calculateMaterials } from "../../../../lib/switchpoint/calculations";
import { MaterialCalculator } from "../widgets/material-calculator";
import { useSwitchPointContext } from "../../../../contexts/switch-point-context";
import { useGameData } from "../../../../hooks/use-game-data";
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

interface MaterialCalculationSectionProps {
  currentCharacter: Character;
}

export function MaterialCalculationSection({ currentCharacter }: MaterialCalculationSectionProps) {
  // Context에서 필요한 것만 가져오기
  const { updateCharacterMaterials } = useSwitchPointContext();
  const { items, materials } = useGameData();

  // 로컬 상태
  const [showResetDialog, setShowResetDialog] = useState(false);

  // 계산 결과 (이 컴포넌트에서 직접 계산)
  const calculationResult = useMemo((): CalculationResult => {
    if (!currentCharacter) {
      return { materials: [], totalPoints: 0 };
    }

    return calculateMaterials(
      currentCharacter.selectedItems || {},
      currentCharacter.ownedMaterials || {},
      items,
      materials
    );
  }, [currentCharacter, items, materials]);

  // 재료 보유량 업데이트 로직 (리렌더링 최소화)
  const updateMaterialOwned = useCallback(
    async (materialId: string, quantity: number) => {
      try {
        const updatedMaterials = {
          ...currentCharacter.ownedMaterials,
          [materialId]: Math.max(0, quantity),
        };

        // Context를 통해 직접 상태 업데이트 (reloadCharacters 제거)
        await updateCharacterMaterials(currentCharacter.id, updatedMaterials);
      } catch (error) {
        console.error("Failed to update material quantity:", error);
        toast.error("재료 수량 업데이트에 실패했습니다.");
      }
    },
    [currentCharacter.id, currentCharacter.ownedMaterials, updateCharacterMaterials]
  );

  // 모든 재료 초기화 (리렌더링 최소화)
  const resetAllMaterials = useCallback(async () => {
    try {
      // Context를 통해 직접 상태 업데이트 (reloadCharacters 제거)
      await updateCharacterMaterials(currentCharacter.id, {});
      toast.success("모든 보유 재료를 초기화했습니다.");
    } catch (error) {
      console.error("Failed to reset materials:", error);
      toast.error("재료 초기화에 실패했습니다.");
    }
  }, [currentCharacter.id, updateCharacterMaterials]);

  // 초기화 다이얼로그 핸들러
  const handleResetClick = () => {
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    resetAllMaterials();
    setShowResetDialog(false);
  };

  return (
    <div className="sticky top-6">
      <h2 className="text-lg font-semibold mb-4">재료 계산</h2>

      <MaterialCalculator
        materials={calculationResult.materials}
        ownedMaterials={currentCharacter.ownedMaterials || {}}
        onUpdateOwned={updateMaterialOwned}
        onResetClick={handleResetClick}
      />

      {/* 재료 초기화 확인 다이얼로그 */}
      <AlertDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>모든 보유 재료를 초기화하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              입력한 모든 보유 재료가 초기화됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              className="bg-destructive  hover:bg-destructive/90 cursor-pointer">
              초기화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
