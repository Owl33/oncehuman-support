// app/switchpoint/components/character-dashboard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Badge } from "@/components/base/badge";
import { Progress } from "@/components/base/progress";
import { ArrowRight, Package, TrendingUp } from "lucide-react";
import { Character } from "@/types/character";

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
  selectCharacter: (characterId: string) => void;
  changeViewMode: (mode: "dashboard" | "detail") => void;
}

export function CharacterDashboard({
  characterSummaries,
  selectCharacter,
  changeViewMode,
}: CharacterDashboardProps) {
  const handleCharacterClick = (characterId: string) => {
    selectCharacter(characterId);
    changeViewMode("detail");
  };

  // 최대 포인트 계산 (진행률 표시용)
  // const maxPoints = Math.max(...characterSummaries.map((c) => c.summary.totalPoints), 1);
  const maxPoints = 20000;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {characterSummaries.map((character) => {
        const { summary } = character;
        const hasItems = summary.totalSelectedItems > 0;

        return (
          <Card
            key={character.id}
            className="hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleCharacterClick(character.id)}>
            <CardHeader className="">
              <div className="flex items-center justify-between overflow-hidden">
                <CardTitle
                  className="
                flex-1
                text-lg text-ellipsis overflow-hidden ">
                  {character.name}
                </CardTitle>
                <ArrowRight className="basis-[16px] ml-4 h-4 w-4  group-hover:translate-x-1 transition-transform" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 선택된 아이템 수 */}
              <div className="flex items-center justify-between ">
                <span className="">선택 아이템</span>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span className="">{summary.totalSelectedItems}개</span>
                </div>
              </div>

              {hasItems ? (
                <>
                  {/* 총 필요 포인트 */}
                  <div>
                    <div className="flex items-center justify-between  mb-2">
                      <span className="">필요 포인트</span>
                      <span className=" text-lg">{summary.totalPoints.toLocaleString()}P</span>
                    </div>
                    <Progress
                      value={(summary.totalPoints / maxPoints) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* 부족한 재료 TOP 3 */}
                  {summary.topMissingMaterials.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-medium">포인트 상위 재료 3개</span>
                      </div>
                      <div className="space-y-1">
                        {summary.topMissingMaterials.slice(0, 3).map((material, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                            <span className="text-xs font-medium truncate flex-1 min-w-0">
                              {material.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs ml-2 flex-shrink-0">
                              {material.points.toLocaleString()}P
                            </Badge>
                          </div>
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
                  <p className="">아이템을 선택해주세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
