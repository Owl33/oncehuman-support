// app/switchpoint/components/material-calculator.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { CalculatedMaterial } from "@/types/character";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Input } from "@/components/base/input";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Progress } from "@/components/base/progress";
import { ScrollArea } from "@/components/base/scroll-area";
import { Separator } from "@/components/base/separator";
import {
  CircleCheckBig,
  CircleCheck,
  CircleMinus,
  TrendingUp,
  Package2,
  CircleX,
  RotateCcw,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialCalculatorProps {
  materials: CalculatedMaterial[];
  totalPoints: number;
  ownedMaterials: Record<string, number>;
  onUpdateOwned: (materialId: string, quantity: number) => void;
  onResetClick?: () => void; // 초기화 다이얼로그 호출용
}

export function MaterialCalculator({
  materials,
  totalPoints,
  ownedMaterials,
  onUpdateOwned,
  onResetClick,
}: MaterialCalculatorProps) {
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);
  const [shouldSort, setShouldSort] = useState(true);
  const scrollPositionRef = useRef<number>(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 정렬된 materials (편집 중이 아닐 때만 정렬)
  const sortedMaterials = useMemo(() => {
    if (!shouldSort || editingMaterial) {
      return materials;
    }
    return [...materials].sort((a, b) => {
      const aPoints =
        Math.max(0, a.required - (ownedMaterials[a.id] || 0)) * (a.points / a.required);
      const bPoints =
        Math.max(0, b.required - (ownedMaterials[b.id] || 0)) * (b.points / b.required);
      return bPoints - aPoints;
    });
  }, [materials, ownedMaterials, shouldSort, editingMaterial]);

  const handleOwnedChange = (materialId: string, value: string) => {
    const material = materials.find((m) => m.id === materialId);
    if (!material) return;

    let quantity = parseInt(value) || 0;
    quantity = Math.max(0, Math.min(quantity, material.required));

    onUpdateOwned(materialId, quantity);
  };

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

  const handleFillAllMaterials = () => {
    materials.forEach((material) => {
      onUpdateOwned(material.id, material.required);
    });
  };

  const handleEditStart = (materialId: string) => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollPositionRef.current = scrollElement.scrollTop;
      }
    }
    setShouldSort(false);
    setEditingMaterial(materialId);
  };

  const handleEditEnd = () => {
    setEditingMaterial(null);
    setTimeout(() => {
      setShouldSort(true);
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (scrollElement) {
          scrollElement.scrollTop = scrollPositionRef.current;
        }
      }
    }, 100);
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

  const completedCount = sortedMaterials.filter(
    (m) => (ownedMaterials[m.id] || 0) >= m.required
  ).length;
  const completionRate = Math.round((completedCount / sortedMaterials.length) * 100);
  const isAllComplete = completedCount === sortedMaterials.length;
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
      <ScrollArea
        className="h-[56vh]"
        ref={scrollAreaRef}>
        <div className="px-2 pb-2 space-y-1">
          {sortedMaterials.map((material, index) => {
            const owned = ownedMaterials[material.id] || 0;
            const isComplete = owned >= material.required;
            const progress = Math.min((owned / material.required) * 100, 100);
            const currentPoints =
              Math.max(0, material.required - owned) * (material.points / material.required);

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
                            className="h-4 w-4"
                            color="red"
                          />
                        ) : (
                          <CircleCheck
                            className="h-4 w-4"
                            color="green"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{material.name}</p>
                        {material.needed > 0 && (
                          <p className="text-xs text-muted-foreground">{material.needed}개 부족</p>
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
                        value={owned}
                        onChange={(e) => handleOwnedChange(material.id, e.target.value)}
                        onFocus={() => handleEditStart(material.id)}
                        onBlur={handleEditEnd}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditEnd();
                        }}
                        className="w-full text-center font-mono text-sm"
                        min="0"
                      />
                    </div>

                    <div className="col-span-2 text-center">
                      {currentPoints > 0 ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-xs border-orange-200 bg-orange-50 text-orange-700 min-w-[60px] justify-center"
                          )}>
                          {Math.round(currentPoints).toLocaleString()}P
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="font-mono text-xs border-green-200 bg-green-50 text-green-700 min-w-[60px] justify-center">
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
                            className="h-3.5 w-3.5"
                            color="green"
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
                            className="h-3.5 w-3.5"
                            color="red"
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
                        isComplete ? "[&>div]:bg-green-500" : "[&>div]:bg-primary"
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
