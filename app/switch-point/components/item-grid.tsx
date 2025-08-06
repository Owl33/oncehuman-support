// app/switchpoint/components/item-grid.tsx
"use client";

import { Item } from "../types/switchpoint";
import { Card, CardContent } from "@/components/base/card";
import { Button } from "@/components/base/button";
import { Input } from "@/components/base/input";
import { Badge } from "@/components/base/badge";
import { ScrollArea } from "@/components/base/scroll-area";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

interface ItemGridProps {
  items: Item[];
  selectedItems: Record<string, number>;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export function ItemGrid({ items, selectedItems, onUpdateQuantity }: ItemGridProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handleQuantityChange = (itemId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    onUpdateQuantity(itemId, quantity);
  };

  const adjustQuantity = (itemId: string, delta: number) => {
    const currentQuantity = selectedItems[itemId] || 0;
    onUpdateQuantity(itemId, Math.max(0, currentQuantity + delta));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        이 카테고리에는 아이템이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => {
        const quantity = selectedItems[item.id] || 0;
        const isEditing = editingItem === item.id;
        const isSelected = quantity > 0;

        return (
          <Card
          
            key={item.id}
            className={`transition-all ${
              isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {isSelected && <Badge variant="default">선택됨</Badge>}
                </div>

                {/* 필요 재료 미리보기 */}
                <div className="text-sm text-muted-foreground mb-3">
                  <p className="mb-1">필요 재료:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.requiment.slice(0, 3).map((req, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs">
                        {req.id} x{req.stock}
                      </Badge>
                    ))}
                    {item.requiment.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs">
                        +{item.requiment.length - 3}개
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 수량 조절 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustQuantity(item.id, -1)}
                    disabled={quantity === 0}>
                    <Minus className="h-4 w-4" />
                  </Button>

                  {isEditing ? (
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      onBlur={() => setEditingItem(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setEditingItem(null);
                      }}
                      className="w-20 text-center"
                      min="0"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setEditingItem(item.id)}
                      className="w-20 py-1 text-center font-medium border rounded hover:bg-muted transition-colors">
                      {quantity}개
                    </button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => adjustQuantity(item.id, 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
