"use client";

import React, { useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ViewModeToggle } from "@/components/actions/view-mode-toggle";
import { Button } from "@/components/base/button";
import { Download, Upload } from "lucide-react";
import { ViewMode } from "@/types/character";
import { toast } from "sonner";

interface SwitchPointHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExportData: () => Promise<string>;
  onImportData: (jsonData: string) => Promise<void>;
}

export function SwitchPointHeader({ 
  viewMode, 
  onViewModeChange, 
  onExportData, 
  onImportData 
}: SwitchPointHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 데이터 내보내기
  const handleExport = async () => {
    try {
      const jsonData = await onExportData();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `oncehuman-switchpoint-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("데이터를 성공적으로 내보냈습니다.");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("데이터 내보내기에 실패했습니다.");
    }
  };

  // 데이터 가져오기
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await onImportData(text);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("데이터 가져오기에 실패했습니다.");
    }

    // 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const actions = (
    <div className="flex items-center gap-2">
      {/* 데이터 관리 */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          내보내기
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          가져오기
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* 뷰 모드 토글 */}
      <ViewModeToggle
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );

  return (
    <PageHeader
      title="서버 이전 포인트 계산"
      description="서버 이전에 필요한 재료와 포인트를 계산합니다"
      actions={actions}
    />
  );
}