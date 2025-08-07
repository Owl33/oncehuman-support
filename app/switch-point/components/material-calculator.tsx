// app/switchpoint/components/material-calculator.tsx
"use client";

import { CalculatedMaterial } from '@/types/character';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card';
import { Input } from '@/components/base/input';
import { Badge } from '@/components/base/badge';
import { Progress } from '@/components/base/progress';
import { ScrollArea } from '@/components/base/scroll-area';
import { Separator } from '@/components/base/separator';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface MaterialCalculatorProps {
  materials: CalculatedMaterial[];
  totalPoints: number;
  ownedMaterials: Record<string, number>;
  onUpdateOwned: (materialId: string, quantity: number) => void;
}

export function MaterialCalculator({
  materials,
  totalPoints,
  ownedMaterials,
  onUpdateOwned,
}: MaterialCalculatorProps) {
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null);

  const handleOwnedChange = (materialId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    onUpdateOwned(materialId, quantity);
  };

  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>아이템을 선택하면 필요한 재료가 표시됩니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          총 필요 포인트: {totalPoints.toLocaleString()}P
        </CardTitle>
        <Progress 
          value={100} 
          className="h-2 mt-2" 
        />
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-6 pt-0">
            {/* 헤더 */}
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-3">
              <div>재료명</div>
              <div className="text-center">필요</div>
              <div className="text-center">보유</div>
              <div className="text-right">포인트</div>
            </div>
            
            <Separator className="mb-3" />

            {/* 재료 목록 */}
            <div className="space-y-2">
              {materials.map((material) => {
                const isEditing = editingMaterial === material.id;
                const owned = ownedMaterials[material.id] || 0;
                const isComplete = owned >= material.required;
                const progress = Math.min((owned / material.required) * 100, 100);

                return (
                  <div
                    key={material.id}
                    className={`rounded-lg border p-3 transition-all ${
                      isComplete ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* 재료 정보 */}
                    <div className="grid grid-cols-4 gap-2 items-center mb-2">
                      <div className="font-medium flex items-center gap-1">
                        {isComplete ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-orange-500" />
                        )}
                        <span className="">{material.name}</span>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant="outline">{material.required}</Badge>
                      </div>
                      
                      <div className="text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={owned}
                            onChange={(e) => handleOwnedChange(material.id, e.target.value)}
                            onBlur={() => setEditingMaterial(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingMaterial(null);
                            }}
                            className="h-7 w-16 mx-auto text-center"
                            min="0"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => setEditingMaterial(material.id)}
                            className="w-16 mx-auto py-1 text-center border rounded hover:bg-muted transition-colors "
                          >
                            {owned}
                          </button>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <Badge 
                          variant={material.points > 0 ? "destructive" : "secondary"}
                        >
                          {material.points}P
                        </Badge>
                      </div>
                    </div>

                    {/* 진행률 바 */}
                    <Progress value={progress} className="h-1.5" />
                    
                    {/* 부족 개수 표시 */}
                    {material.needed > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {material.needed}개 부족
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}