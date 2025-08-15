// app/switchpoint/components/material-calculator.tsx
"use client";

import { useState, useEffect } from "react";
import { CalculatedMaterial } from "@/types/character";
import { Input } from "@/components/base/input";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Progress } from "@/components/base/progress";
import { ScrollArea } from "@/components/base/scroll-area";
import {
  CircleCheckBig,
  CircleCheck,
  CircleMinus,
  TrendingUp,
  Package2,
  CircleX,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialCalculatorProps {
  materials: CalculatedMaterial[];
  ownedMaterials: Record<string, number>;
  onUpdateOwned: (materialId: string, quantity: number) => void;
  onResetClick?: () => void; // 초기화 다이얼로그 호출용
}

export function MaterialCalculator({
  materials,
  ownedMaterials,
  onUpdateOwned,
  onResetClick,
}: MaterialCalculatorProps) {
  // 최소한의 상태 관리
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [pendingValues, setPendingValues] = useState<Record<string, string>>({});
  const [materialOrder, setMaterialOrder] = useState<CalculatedMaterial[]>([]);
  const [isOrderInitialized, setIsOrderInitialized] = useState(false);

  // materials가 변경되면 순서 업데이트 (완료된 아이템 위치 유지)
  useEffect(() => {
    setMaterialOrder((prevOrder) => {
      // 처음 초기화되는 경우 - 완료된 항목을 아래로 자동 정렬
      if (!isOrderInitialized && materials.length > 0) {
        const sortedMaterials = [...materials].sort((a, b) => {
          const aOwned = ownedMaterials[a.id] || 0;
          const bOwned = ownedMaterials[b.id] || 0;
          const aComplete = aOwned >= a.required;
          const bComplete = bOwned >= b.required;

          // 완료된 항목을 아래로, 미완료 항목을 위로
          if (aComplete && !bComplete) return 1;
          if (!aComplete && bComplete) return -1;
          return 0;
        });
        setIsOrderInitialized(true);
        return sortedMaterials;
      }

      // 이후 materials 변경 시에는 기존 순서 유지
      const existingIds = new Set(prevOrder.map((m) => m.id));
      const newMaterials = materials.filter((m) => !existingIds.has(m.id));
      const updatedExisting = prevOrder
        .filter((m) => materials.some((mat) => mat.id === m.id))
        .map((oldMaterial) => materials.find((m) => m.id === oldMaterial.id) || oldMaterial);

      return [...updatedExisting, ...newMaterials];
    });
  }, [materials, ownedMaterials, isOrderInitialized]);

  // 캐릭터 변경이나 페이지 이동 시 초기화 플래그 리셋
  const materialKey = materials.length > 0 ? materials[0]?.id : "";
  useEffect(() => {
    setIsOrderInitialized(false);
  }, [materialKey]);

  const displayMaterials = materialOrder;

  // 즉시 UI 업데이트를 위한 핸들러 (debounce 없음)
  const handleInputChange = (materialId: string, value: string) => {
    // 로컬 상태 즉시 업데이트 (UI 반응성)
    setPendingValues((prev) => ({ ...prev, [materialId]: value }));
  };

  // Input value 가져오기 (pending 값 우선)
  const getInputValue = (materialId: string) => {
    if (materialId in pendingValues) {
      return pendingValues[materialId];
    }
    return (ownedMaterials[materialId] || 0).toString();
  };

  const handleFillAll = (materialId: string) => {
    const material = materialOrder.find((m) => m.id === materialId);
    if (!material) return;

    onUpdateOwned(materialId, material.required);

    // 완료되었으므로 맨 아래로 이동
    setMaterialOrder((prev) => {
      const filtered = prev.filter((m) => m.id !== materialId);
      const completedMaterial = prev.find((m) => m.id === materialId);
      return completedMaterial ? [...filtered, completedMaterial] : prev;
    });
  };

  const handleEmptyAll = (materialId: string) => {
    const material = materialOrder.find((m) => m.id === materialId);
    if (!material) return;

    onUpdateOwned(materialId, 0);

    // 미완료 상태가 되었으므로 맨 위로 이동
    setMaterialOrder((prev) => {
      const filtered = prev.filter((m) => m.id !== materialId);
      const incompleteMaterial = prev.find((m) => m.id === materialId);
      return incompleteMaterial ? [incompleteMaterial, ...filtered] : prev;
    });
  };

  // Focus 관리
  const handleFocus = (materialId: string) => {
    setFocusedInput(materialId);
  };

  const handleBlur = (materialId: string) => {
    setFocusedInput(null);

    // pending 값이 있으면 즉시 적용
    if (materialId in pendingValues) {
      const material = materialOrder.find((m) => m.id === materialId);
      if (material) {
        let quantity = parseInt(pendingValues[materialId]) || 0;
        quantity = Math.max(0, Math.min(quantity, material.required));

        // 실제 값 업데이트
        onUpdateOwned(materialId, quantity);

        // 완료되었다면 맨 아래로 이동
        if (quantity >= material.required) {
          setMaterialOrder((prev) => {
            const filtered = prev.filter((m) => m.id !== materialId);
            const completedMaterial = prev.find((m) => m.id === materialId);
            return completedMaterial ? [...filtered, completedMaterial] : prev;
          });
        }
      }

      // pending 값 제거
      setPendingValues((prev) => {
        const newPending = { ...prev };
        delete newPending[materialId];
        return newPending;
      });
    }
  };

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <Package2 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className=" text-muted-foreground">설비를 선택하면</p>
        <p className=" text-muted-foreground">필요한 재료가 표시됩니다</p>
      </div>
    );
  }

  const hasAnyOwned = Object.values(ownedMaterials).some((v) => v > 0);
  const actualTotalPoints = materialOrder.reduce((sum, m) => {
    const needed = Math.max(0, m.required - (ownedMaterials[m.id] || 0));
    return sum + needed * (m.points / m.required);
  }, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="space-y-4 pb-4">
        {/* Points Display with Action Buttons */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">필요 포인트</p>
                <p className="text-2xl font-bold">
                  {Math.round(actualTotalPoints).toLocaleString()}
                  <span className=" font-normal text-muted-foreground ml-1">P</span>
                  <span className=" font-normal text-muted-foreground ml-1">/ 20,000 P</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end">
              {hasAnyOwned && onResetClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetClick}
                  className="text-xs hover:bg-destructive/10 hover:text-destructive whitespace-nowrap">
                  <RotateCcw className="w-3 h-3 mr-1" />
                  보유 재료 초기화
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            value={Math.min((actualTotalPoints / 20000) * 100, 100)}
            className="h-2"
          />
        </div>

        {/* Column Headers - Hidden on mobile */}
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4">재료</div>
          <div className="col-span-2 text-center">필요</div>
          <div className="col-span-2 text-center">보유</div>
          <div className="col-span-2 text-center">포인트</div>
          <div className="col-span-2 text-center"></div>
        </div>
      </div>

      {/* Materials List */}
      <ScrollArea className="h-auto sm:h-[64vh]">
        <div className="px-2 pb-2 space-y-1">
          {displayMaterials.map((material) => {
            const inputValue = getInputValue(material.id);
            const actualOwned = ownedMaterials[material.id] || 0;
            const isComplete = actualOwned >= material.required;
            const progress = Math.min((actualOwned / material.required) * 100, 100);
            const currentPoints =
              Math.max(0, material.required - actualOwned) * (material.points / material.required);

            return (
              <div
                key={material.id}
                className={cn(
                  "group relative rounded-lg transition-all duration-200",
                  "hover:bg-muted/50"
                )}>
                <div className="px-3 sm:px-4 py-3">
                  {/* Main Content - Responsive Layout */}
                  <div className="sm:grid sm:grid-cols-12 gap-2 items-center">
                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-3">
                      {/* Material Name & Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3">
                            {!isComplete ? (
                              <CircleX className="h-4 w-4 text-destructive" />
                            ) : (
                              <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{material.name}</p>
                            {actualOwned < material.required && (
                              <p className="text-xs text-muted-foreground">
                                {material.required - actualOwned}개 부족
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentPoints > 0 ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300">
                              {Math.round(currentPoints).toLocaleString()}P
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
                              완료
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            필요: {material.required}
                          </span>
                          <span className="text-sm text-muted-foreground">보유:</span>
                          <Input
                            value={inputValue}
                            onChange={(e) => handleInputChange(material.id, e.target.value)}
                            onFocus={() => handleFocus(material.id)}
                            onBlur={() => handleBlur(material.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            className={cn(
                              "w-16 text-center font-mono text-sm",
                              focusedInput === material.id && "ring-2 ring-primary"
                            )}
                            min="0"
                            max={material.required}
                            type="number"
                          />
                        </div>

                        {!isComplete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFillAll(material.id)}
                            className="text-green-600 dark:text-green-400"
                            title="필요 수량만큼 채우기">
                            <CircleCheckBig className="h-4 w-4 mr-1" />
                            채우기
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmptyAll(material.id)}
                            className="text-destructive"
                            title="보유 수량 초기화">
                            <CircleMinus className="h-4 w-4 mr-1" />
                            초기화
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:contents">
                      <div className="col-span-4 flex items-center">
                        <div className="mr-3">
                          {!isComplete ? (
                            <CircleX className="h-4 w-4 text-destructive" />
                          ) : (
                            <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold ">{material.name}</p>
                          {actualOwned < material.required && (
                            <p className=" text-muted-foreground">
                              {material.required - actualOwned}개 부족
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="font-mono  text-muted-foreground">
                          {material.required}
                        </span>
                      </div>

                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <Input
                          value={inputValue}
                          onChange={(e) => handleInputChange(material.id, e.target.value)}
                          onFocus={() => handleFocus(material.id)}
                          onBlur={() => handleBlur(material.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                            }
                          }}
                          className={cn(
                            "w-full text-center font-mono  transition-colors",
                            focusedInput === material.id && "ring-2 ring-primary"
                          )}
                          min="0"
                          max={material.required}
                          type="number"
                        />
                      </div>

                      <div className="col-span-2 text-center">
                        {currentPoints > 0 ? (
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-xs border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300 min-w-[60px] justify-center"
                            )}>
                            {Math.round(currentPoints).toLocaleString()}P
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300 min-w-[60px] justify-center">
                            완료
                          </Badge>
                        )}
                      </div>

                      <div className="col-span-2 text-center">
                        {!isComplete ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleFillAll(material.id)}
                            title="필요 수량만큼 채우기">
                            <CircleCheckBig className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEmptyAll(material.id)}
                            title="보유 수량 초기화">
                            <CircleMinus className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <Progress
                      value={progress}
                      className={cn(
                        "h-1",
                        isComplete
                          ? "[&>div]:bg-green-600 dark:[&>div]:bg-green-400"
                          : "[&>div]:bg-primary"
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
