"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Character, Item, ItemCategory, CATEGORY_LABELS } from "@/types/character";
import { useGameData } from "../hooks/use-game-data";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { Badge } from "@/components/base/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/base/tabs";
import { ScrollArea } from "@/components/base/scroll-area";
import { Separator } from "@/components/base/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/base/tooltip";
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
import {
  Plus,
  Minus,
  Package,
  RotateCcw,
  Boxes,
  Box,
  Import,
  Pickaxe,
  Parentheses,
  Cpu,
  Car,
  Swords,
  Rabbit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface ItemSelectionProps {
  currentCharacter: Character;
  onUpdateItems: (characterId: string, selectedItems: Record<string, number>) => Promise<void>;
}

const CATEGORY_ICONS: Record<ItemCategory, React.ReactNode> = {
  product: <Swords className="h-4 w-4" />,
  storage: <Import className="h-4 w-4" />,
  production: <Pickaxe className="h-4 w-4" />,
  processing: <Cpu className="h-4 w-4" />,
  functional: <Parentheses className="h-4 w-4" />,
  vehicle: <Car className="h-4 w-4" />,
  animal: <Rabbit className="h-4 w-4" />,
};

export function ItemSelection({ currentCharacter, onUpdateItems }: ItemSelectionProps) {
  const { items, materials } = useGameData();
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>("storage");
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Material id -> name 매핑
  const materialMap = useMemo(() => {
    if (!materials || !Array.isArray(materials)) return {};
    return Object.fromEntries(materials.map((m) => [m.id, m.name]));
  }, [materials]);

  // 카테고리별 아이템 그룹화
  const itemsByCategory = useMemo(() => {
    const categorized: Record<ItemCategory, Item[]> = {
      product: [],
      storage: [],
      production: [],
      processing: [],
      functional: [],
      vehicle: [],
      animal: [],
    };

    items.forEach((item) => {
      if (categorized[item.category as ItemCategory]) {
        categorized[item.category as ItemCategory].push(item);
      }
    });

    return categorized;
  }, [items]);

  // 현재 카테고리의 아이템들
  const currentItems = itemsByCategory[selectedCategory] || [];

  // 선택된 아이템 통계
  const stats = useMemo(() => {
    const selectedItems = currentCharacter.selectedItems || {};
    return {
      selectedCount: Object.values(selectedItems).filter((q) => q > 0).length,
      totalQuantity: Object.values(selectedItems).reduce((sum, q) => sum + q, 0),
    };
  }, [currentCharacter.selectedItems]);

  // 아이템 수량 업데이트
  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        const updatedItems = {
          ...currentCharacter.selectedItems,
          [itemId]: Math.max(0, quantity),
        };

        // 0이면 제거
        if (quantity <= 0) {
          delete updatedItems[itemId];
        }

        await onUpdateItems(currentCharacter.id, updatedItems);
      } catch (error) {
        console.error("Failed to update item quantity:", error);
        toast.error("아이템 수량 업데이트에 실패했습니다.");
      }
    },
    [currentCharacter, onUpdateItems]
  );

  // 모든 아이템 초기화
  const resetAllItems = useCallback(async () => {
    try {
      await onUpdateItems(currentCharacter.id, {});
      toast.success("모든 아이템을 초기화했습니다.");
    } catch (error) {
      console.error("Failed to reset items:", error);
      toast.error("아이템 초기화에 실패했습니다.");
    }
  }, [currentCharacter, onUpdateItems]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    updateItemQuantity(itemId, quantity);
  };

  const adjustQuantity = (itemId: string, delta: number) => {
    const currentQuantity = (currentCharacter.selectedItems || {})[itemId] || 0;
    updateItemQuantity(itemId, Math.max(0, currentQuantity + delta));
  };

  const categories = Object.keys(CATEGORY_LABELS) as ItemCategory[];

  return (
    <>
      <div className="space-y-4">
        {/* 카테고리 탭 */}
        <Tabs
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as ItemCategory)}>
          <TabsList className="flex h-11 w-full overflow-x-auto scrollbar-none">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="cursor-pointer flex-shrink-0 min-w-fit px-2 sm:px-3"
                title={CATEGORY_LABELS[category]}>
                {CATEGORY_ICONS[category]}
                <span className="hidden sm:inline ml-2">{CATEGORY_LABELS[category]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* 아이템 그리드 */}
        <ScrollArea className="h-auto sm:h-[60vh]">
          <div className="p-4">
            {/* 선택헤더 */}
            <div className="my-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-4 sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-primary" />
                    <span className="text-sm md:text-base font-medium">
                      {stats.selectedCount}개 선택
                    </span>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-4"
                  />
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-primary" />
                    <span className="text-sm md:text-base font-medium">총 {stats.totalQuantity}개</span>
                  </div>
                </div>

                {/* Reset Button */}
                {stats.selectedCount > 0 && (
                  <div className="w-full sm:w-auto flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResetDialog(true)}
                      className="text-xs hover:bg-destructive/10 hover:text-destructive whitespace-nowrap">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      선택 초기화
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            {currentItems.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="rounded-full bg-muted/50 p-4 mb-4 mx-auto w-fit">
                    <Package className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className=" text-muted-foreground">이 카테고리에는 아이템이 없습니다</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 pb-4">
                {currentItems.map((item, index) => {
                  const quantity = (currentCharacter.selectedItems || {})[item.id] || 0;
                  const isSelected = quantity > 0;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "p-3 relative rounded-lg transition-all duration-200",
                        "bg-card hover:shadow-md",
                        isSelected && "ring-1 ring-primary/50 bg-primary/5 shadow-md",
                        // 스태거 애니메이션 (새 카테고리 로드 시)
                        "animate-in fade-in slide-in-from-bottom-2"
                      )}
                      style={{
                        animationDelay: `${Math.min(index * 30, 300)}ms`,
                        animationFillMode: "backwards",
                      }}>
                      {/* 셀렉트 우측 상단 표기 */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 z-10">
                          <div className="relative bg-primary rounded-sm border-0 h-6 px-2">
                            <span className="text-primary-foreground ">{quantity}</span>
                          </div>
                        </div>
                      )}

                      {/* 설비 이름 */}
                      <h3 className="font-semibold text-base sm:text-lg py-2 leading-tight">
                        {item.name}
                      </h3>

                      {/* 필요 재료 나열 */}
                      <div className="py-2 min-h-[3rem] sm:min-h-[4rem]">
                        <p className="mb-1 text-xs text-muted-foreground">필요 재료</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex flex-wrap gap-1 cursor-help">
                                {item.requiment.slice(0, 2).map((req, index) => (
                                  <Badge
                                    variant="outline"
                                    key={index}>
                                    {`${materialMap[req.id] || req.id} × ${req.stock}`}
                                  </Badge>
                                ))}
                                {item.requiment.length > 2 && (
                                  <Badge variant="secondary">+{item.requiment.length - 2}개</Badge>
                                )}
                              </div>
                            </TooltipTrigger>
                            {item.requiment.length > 2 && (
                              <TooltipContent
                                side="top"
                                className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold text-sm">모든 필요 재료:</p>
                                  <div className="grid grid-cols-1 gap-1">
                                    {item.requiment.map((req, index) => (
                                      <div
                                        key={index}
                                        className="text-xs">
                                        {`${materialMap[req.id] || req.id} × ${req.stock}`}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* 개수 플마 */}
                      <div className="py-2 flex items-center gap-1">
                        <Button
                          variant={isSelected ? "secondary" : "outline"}
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => adjustQuantity(item.id, -1)}
                          disabled={quantity === 0}>
                          <Minus className="h-3 w-3" />
                        </Button>

                        <Input
                          value={quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                          }}
                          className="flex-1 h-7 text-center "
                          min="0"
                        />

                        <Button
                          variant={isSelected ? "secondary" : "outline"}
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => adjustQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 초기화 확인 다이얼로그 */}
      <AlertDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}>
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
              onClick={() => {
                resetAllItems();
                setShowResetDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90">
              초기화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
