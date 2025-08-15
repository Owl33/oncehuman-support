"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/base/button";
import { useTimerStorage } from "../hooks/use-timer-storage";
import { Timer, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function CoopTimerHeader() {
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

  const actions = isDev ? (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearData}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
    >
      <RotateCcw className="h-3 w-3 mr-1" />
      Dev: 초기화
    </Button>
  ) : null;

  return (
    <PageHeader
      title="협동 타이머"
      description="OnceHuman 협동 이벤트 진행상황을 추적하세요"
      icon={Timer}
      actions={actions}
    />
  );
}