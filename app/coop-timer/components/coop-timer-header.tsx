"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/base/button";
import { useTimerStorage } from "../hooks/use-timer-storage";
import { Timer, RotateCcw, Grid3X3, List } from "lucide-react";
import { toast } from "sonner";

interface CoopTimerHeaderProps {
  viewMode?: "modern" | "compact";
  onViewModeChange?: (mode: "modern" | "compact") => void;
}

export function CoopTimerHeader({ viewMode = "modern", onViewModeChange }: CoopTimerHeaderProps) {
  const { clearProgress } = useTimerStorage();

  // 개발/디버깅용으로만 사용 - 일반 사용자에게는 숨김
  const isDev = process.env.NODE_ENV === 'development';

  const handleClearData = () => {
    if (confirm("개발자용: 모든 협동 타이머 데이터를 삭제하시겠습니까?")) {
      clearProgress();
      toast.success("데이터가 삭제되었습니다.", {
        description: "페이지를 새로고침하면 변경사항이 적용됩니다."
      });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const actions = (
    <div className="flex items-center gap-2">
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          <Button
            variant={viewMode === "compact" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("compact")}
            className="h-7 px-2 text-xs gap-1"
          >
            <List className="h-3 w-3" />
            컴팩트
          </Button>
          <Button
            variant={viewMode === "modern" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("modern")}
            className="h-7 px-2 text-xs gap-1"
          >
            <Grid3X3 className="h-3 w-3" />
            상세
          </Button>
        </div>
      )}

      {/* Dev Actions */}
      {isDev && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearData}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Dev: 초기화
        </Button>
      )}
    </div>
  );

  return (
    <PageHeader
      title="🎯 협동 타이머"
      description="OnceHuman 협동 이벤트 진행상황을 실시간으로 추적하고 관리하세요"
      icon={Timer}
      actions={actions}
    />
  );
}