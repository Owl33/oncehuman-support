// app/switchpoint/components/character-dashboard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/base/card';
import { Badge } from '@/components/base/badge';
import { Button } from '@/components/base/button';
import { Progress } from '@/components/base/progress';
import { ArrowRight, Package, AlertCircle } from 'lucide-react';
import { Character } from '@/types/character';

interface CharacterDashboardProps {
  characterSummaries: Array<Character & {
    summary: {
      totalPoints: number;
      topMissingMaterials: { name: string; points: number }[];
      totalSelectedItems: number;
    };
  }>;
  selectCharacter: (characterId: string) => void;
  changeViewMode: (mode: 'dashboard' | 'detail') => void;
}

export function CharacterDashboard({
  characterSummaries,
  selectCharacter,
  changeViewMode,
}: CharacterDashboardProps) {
  const handleCharacterClick = (characterId: string) => {
    selectCharacter(characterId);
    changeViewMode('detail');
  };

  // 최대 포인트 계산 (진행률 표시용)
  const maxPoints = Math.max(...characterSummaries.map(c => c.summary.totalPoints), 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {characterSummaries.map((character) => {
        const { summary } = character;
        const hasItems = summary.totalSelectedItems > 0;
        
        return (
          <Card
            key={character.id}
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleCharacterClick(character.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{character.name}</CardTitle>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* 선택된 아이템 수 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">선택 아이템</span>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">{summary.totalSelectedItems}개</span>
                </div>
              </div>

              {hasItems ? (
                <>
                  {/* 총 필요 포인트 */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">필요 포인트</span>
                      <span className="font-bold text-lg">
                        {summary.totalPoints.toLocaleString()}P
                      </span>
                    </div>
                    <Progress 
                      value={(summary.totalPoints / maxPoints) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* 부족한 재료 TOP 3 */}
                  {summary.topMissingMaterials.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>부족한 재료</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {summary.topMissingMaterials.map((material, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {material.name} ({material.points}P)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 마지막 업데이트 시간 */}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      마지막 업데이트: {new Date(character.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">아이템을 선택해주세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}