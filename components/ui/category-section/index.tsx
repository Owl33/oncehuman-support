"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/base/card";
import { Badge } from "@/components/base/badge";
import { Progress } from "@/components/base/progress";
import { cn } from "@/lib/utils";
import { 
  categoryVariants, 
  categoryIconVariants, 
  categoryTitleVariants,
  categoryThemes
} from "./variants";
import {
  CategorySectionProps,
  CategoryHeaderProps,
  CategoryIconProps,
  CategoryStatsProps
} from "./types";

/**
 * 카테고리 아이콘 컴포넌트
 */
function CategoryIcon({ icon: Icon, variant, size, className }: CategoryIconProps) {
  return (
    <div className={cn(categoryIconVariants({ variant, size }), className)}>
      <Icon className={size === "compact" ? "w-5 h-5" : "w-7 h-7"} />
    </div>
  );
}

/**
 * 카테고리 통계 컴포넌트
 */
function CategoryStats({ 
  completedCount, 
  totalCount, 
  hideProgress, 
  mode, 
  variant 
}: CategoryStatsProps) {
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (mode === "compact") {
    return (
      <div className="flex items-center gap-2">
        {hideProgress ? (
          <span className="text-xs text-muted-foreground">
            ({totalCount}개 이벤트)
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            ({completedCount}/{totalCount})
          </span>
        )}
      </div>
    );
  }

  // Modern mode
  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="text-right">
        <div className={cn(
          "text-2xl font-bold",
          categoryTitleVariants({ variant, size: "modern" })
        )}>
          {completionRate.toFixed(0)}%
        </div>
        <Progress 
          value={completionRate} 
          className="w-24 h-2 mt-2"
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            완료: <span className="font-semibold text-foreground">{completedCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            남은: <span className="font-semibold text-foreground">{totalCount - completedCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-muted-foreground">
            진행률: <span className="font-semibold text-foreground">{completionRate.toFixed(1)}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 카테고리 헤더 컴포넌트
 */
function CategoryHeader({
  category,
  title,
  icon,
  mode,
  completedCount = 0,
  totalCount = 0,
  hideProgress = false,
  className
}: CategoryHeaderProps) {
  const theme = categoryThemes[category];

  if (mode === "compact") {
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <CategoryIcon icon={icon} variant={category} size="compact" />
          <h3 className={cn(categoryTitleVariants({ variant: category, size: "compact" }))}>
            {title}
          </h3>
          <CategoryStats 
            completedCount={completedCount}
            totalCount={totalCount}
            hideProgress={hideProgress}
            mode="compact"
            variant={category}
          />
        </div>
      </div>
    );
  }

  // Modern mode
  return (
    <CardHeader className={cn(categoryVariants({ variant: category, size: "modern" }), className)}>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <CategoryIcon icon={icon} variant={category} size="modern" />
          <div>
            <h3 className={cn(categoryTitleVariants({ variant: category, size: "modern" }))}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount}개 이벤트 • {completedCount}개 완료
            </p>
          </div>
        </div>

        <CategoryStats 
          completedCount={completedCount}
          totalCount={totalCount}
          hideProgress={hideProgress}
          mode="modern"
          variant={category}
        />
      </div>
    </CardHeader>
  );
}

/**
 * 카테고리 섹션 메인 컴포넌트
 * 
 * @example
 * ```tsx
 * <CategorySection
 *   category="hourly"
 *   icon={Zap}
 *   title="시간별 이벤트"
 *   mode="modern"
 *   completedCount={5}
 *   totalCount={10}
 * >
 *   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 *     {events.map(event => <EventCard key={event.id} event={event} />)}
 *   </div>
 * </CategorySection>
 * ```
 */
export function CategorySection({
  category,
  title,
  icon,
  mode = "compact",
  completedCount = 0,
  totalCount = 0,
  hideProgress = false,
  className,
  children
}: CategorySectionProps) {
  const theme = categoryThemes[category];
  const displayTitle = title || (mode === "modern" ? theme.modernTitle : theme.title);

  if (totalCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: mode === "modern" ? 20 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: mode === "modern" ? 0.4 : 0.2 }}
      className={cn("space-y-3", className)}
    >
      {mode === "compact" ? (
        <>
          <CategoryHeader
            category={category}
            title={displayTitle}
            icon={icon}
            mode="compact"
            completedCount={completedCount}
            totalCount={totalCount}
            hideProgress={hideProgress}
          />
          {children}
        </>
      ) : (
        <Card className="border-2 shadow-sm">
          <CategoryHeader
            category={category}
            title={displayTitle}
            icon={icon}
            mode="modern"
            completedCount={completedCount}
            totalCount={totalCount}
            hideProgress={hideProgress}
          />
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// 타입과 variants 다시 export
export type { CategorySectionProps, CategoryVariant } from "./types";
export { categoryThemes } from "./variants";