// app/switchpoint/components/material-calculator.tsx
"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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
  // 간소화된 상태 관리
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [pendingValues, setPendingValues] = useState<Record<string, string>>({});
  const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // 정렬된 materials - focus 상태와 무관하게 완료된 아이템만 하단으로
  const sortedMaterials = useMemo(() => {
    return [...materials].sort((a, b) => {
      const aOwned = ownedMaterials[a.id] || 0;
      const bOwned = ownedMaterials[b.id] || 0;
      const aComplete = aOwned >= a.required;
      const bComplete = bOwned >= b.required;
      
      // 완료 상태가 다르면 완료된 것을 뒤로
      if (aComplete !== bComplete) {
        return aComplete ? 1 : -1;
      }
      
      // 둘 다 완료되지 않았으면 필요 포인트 순으로 정렬 (높은 순)
      if (!aComplete && !bComplete) {
        const aPoints = Math.max(0, a.required - aOwned) * (a.points / a.required);
        const bPoints = Math.max(0, b.required - bOwned) * (b.points / b.required);
        return bPoints - aPoints;
      }
      
      // 둘 다 완료되었으면 원래 순서 유지
      return 0;
    });
  }, [materials, ownedMaterials]);

  // 디바운스된 업데이트 함수
  const debouncedUpdate = useCallback((materialId: string, value: string) => {
    // 기존 타이머 취소
    if (updateTimeoutRef.current[materialId]) {
      clearTimeout(updateTimeoutRef.current[materialId]);
    }

    // 새 타이머 설정 (500ms 후 업데이트)
    updateTimeoutRef.current[materialId] = setTimeout(() => {
      const material = materials.find((m) => m.id === materialId);
      if (!material) return;

      let quantity = parseInt(value) || 0;
      quantity = Math.max(0, Math.min(quantity, material.required));

      onUpdateOwned(materialId, quantity);
      delete updateTimeoutRef.current[materialId];
    }, 500);
  }, [materials, onUpdateOwned]);

  // 즉시 UI 업데이트를 위한 핸들러
  const handleInputChange = (materialId: string, value: string) => {
    // 로컬 상태 즉시 업데이트 (UI 반응성)
    setPendingValues(prev => ({ ...prev, [materialId]: value }));
    
    // 디바운스된 실제 업데이트
    debouncedUpdate(materialId, value);
  };

  // Input value 가져오기 (pending 값 우선)
  const getInputValue = (materialId: string) => {
    if (materialId in pendingValues) {
      return pendingValues[materialId];
    }
    return (ownedMaterials[materialId] || 0).toString();
  };

  // Cleanup - 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    const timeouts = updateTimeoutRef.current;
    return () => {
      Object.values(timeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const handleFillAll = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    if (!material) return;

    onUpdateOwned(materialId, material.required);
  };

  const handleEmptyAll = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    if (!material) return;

    onUpdateOwned(materialId, 0);
  };


  // Focus 관리 (정렬에 영향 없음)
  const handleFocus = (materialId: string) => {
    setFocusedInput(materialId);
  };

  const handleBlur = (materialId: string) => {
    setFocusedInput(null);
    
    // pending 값이 있으면 즉시 적용
    if (materialId in pendingValues) {
      const material = materials.find((m) => m.id === materialId);
      if (material) {
        let quantity = parseInt(pendingValues[materialId]) || 0;
        quantity = Math.max(0, Math.min(quantity, material.required));
        onUpdateOwned(materialId, quantity);
      }
      
      // pending 값 제거
      setPendingValues(prev => {
        const newPending = { ...prev };
        delete newPending[materialId];
        return newPending;
      });
      
      // 타이머도 취소
      if (updateTimeoutRef.current[materialId]) {
        clearTimeout(updateTimeoutRef.current[materialId]);
        delete updateTimeoutRef.current[materialId];
      }
    }
  };

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <Package2 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">설비를 선택하면</p>
        <p className="text-sm text-muted-foreground">필요한 재료가 표시됩니다</p>
      </div>
    );
  }

  const hasAnyOwned = Object.values(ownedMaterials).some((v) => v > 0);
  const actualTotalPoints = sortedMaterials.reduce((sum, m) => {
    const needed = Math.max(0, m.required - (ownedMaterials[m.id] || 0));
    return sum + needed * (m.points / m.required);
  }, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="space-y-4 pb-4">
        {/* Points Display with Action Buttons */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">필요 포인트</p>
                <p className="text-2xl font-bold">
                  {Math.round(actualTotalPoints).toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground ml-1">P</span>
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ 20,000 P</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {hasAnyOwned && onResetClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetClick}
                  className=" text-xs hover:bg-destructive/10 hover:text-destructive">
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

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-2 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <div className="col-span-4">재료</div>
          <div className="col-span-2 text-center">필요</div>
          <div className="col-span-2 text-center">보유</div>
          <div className="col-span-2 text-center">포인트</div>
          <div className="col-span-2 text-center"></div>
        </div>
      </div>

      {/* Materials List */}
      <ScrollArea className="h-[56vh]">
        <div className="px-2 pb-2 space-y-1">
          {sortedMaterials.map((material) => {
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
                <div className="px-4 py-3">
                  {/* Main Content */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 flex items-center">
                      <div className="mr-3">
                        {!isComplete ? (
                          <CircleX
                            className="h-4 w-4 text-destructive"
                          />
                        ) : (
                          <CircleCheck
                            className="h-4 w-4 text-green-600 dark:text-green-400"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{material.name}</p>
                        {actualOwned < material.required && (
                          <p className="text-xs text-muted-foreground">
                            {material.required - actualOwned}개 부족
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className="font-mono text-sm text-muted-foreground">
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
                          "w-full text-center font-mono text-sm transition-colors",
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
                          <CircleCheckBig
                            className="h-3.5 w-3.5 text-green-600 dark:text-green-400"
                          />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEmptyAll(material.id)}
                          title="보유 수량 초기화">
                          <CircleMinus
                            className="h-3.5 w-3.5 text-destructive"
                          />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <Progress
                      value={progress}
                      className={cn(
                        "h-1",
                        isComplete ? "[&>div]:bg-green-600 dark:[&>div]:bg-green-400" : "[&>div]:bg-primary"
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
