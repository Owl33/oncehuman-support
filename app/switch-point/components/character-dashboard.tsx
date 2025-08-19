"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Badge } from "@/components/base/badge";
import { Progress } from "@/components/base/progress";
import { ArrowRight, Package, TrendingUp } from "lucide-react";
import { Character, ViewMode } from "@/types/character";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CharacterDashboardProps {
  characterSummaries: Array<
    Character & {
      summary: {
        totalPoints: number;
        topMissingMaterials: { name: string; points: number }[];
        totalSelectedItems: number;
      };
    }
  >;
  onSelectCharacter: (characterId: string) => void;
  onChangeViewMode: (mode: ViewMode) => void;
}

export function CharacterDashboard({
  characterSummaries,
  onSelectCharacter,
  onChangeViewMode,
}: CharacterDashboardProps) {
  const handleCharacterClick = (characterId: string) => {
    onSelectCharacter(characterId);
    onChangeViewMode("detail");
  };

  // 최대 포인트 계산 (진행률 표시용)
  const maxPoints = 20000;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {characterSummaries.map((character, index) => {
        const { summary } = character;
        const hasItems = summary.totalSelectedItems > 0;

        return (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={cn(
                "hover:shadow-lg transition-all cursor-pointer group border-2",
                hasItems 
                  ? "border-blue-200 hover:border-blue-300" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => handleCharacterClick(character.id)}
            >
              <CardHeader className="">
                <div className="flex items-center justify-between overflow-hidden">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <CardTitle className="text-lg text-ellipsis overflow-hidden truncate">
                      {character.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{character.scenario || "시나리오 미설정"}</span>
                      <span>•</span>
                      <span>{character.job || "직업 미설정"}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 선택된 아이템 수 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">선택 아이템</span>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{summary.totalSelectedItems}개</span>
                  </div>
                </div>

                {hasItems ? (
                  <>
                    {/* 총 필요 포인트 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">필요 포인트</span>
                        <span className="font-bold text-lg text-orange-600">
                          {summary.totalPoints.toLocaleString()}P
                        </span>
                      </div>
                      <Progress
                        value={Math.min((summary.totalPoints / maxPoints) * 100, 100)}
                        className="h-2"
                      />
                      <div className="text-right text-xs text-muted-foreground mt-1">
                        목표: {maxPoints.toLocaleString()}P
                      </div>
                    </div>

                    {/* 부족한 재료 TOP 3 */}
                    {summary.topMissingMaterials.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-xs font-medium">포인트 상위 재료</span>
                        </div>
                        <div className="space-y-1">
                          {summary.topMissingMaterials.slice(0, 3).map((material, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <span className="text-xs font-medium truncate flex-1 min-w-0">
                                {material.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs ml-2 flex-shrink-0"
                              >
                                {material.points.toLocaleString()}P
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">아이템을 선택해주세요</p>
                  </div>
                )}

                {/* 마지막 업데이트 시간 */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    마지막 업데이트: {new Date(character.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}