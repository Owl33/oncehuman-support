// app/switchpoint/page.tsx
"use client";

import { useSwitchPoint } from "./hooks/use-switchpoint";
import { CharacterDashboard } from "./components/character-dashboard";
import { CharacterDetail } from "./components/character-detail";
import { Button } from "@/components/base/button";
import { Download, Upload, LayoutGrid, ListFilter } from "lucide-react";
import { useRef } from "react";

export default function SwitchPointPage() {
  const { loading, viewMode, changeViewMode, exportData, importData, ...props } = useSwitchPoint();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `switchpoint_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importData(text);
      // 성공 알림 추가 가능
    } catch (error) {
      console.error("Import failed:", error);
      // 에러 알림 추가 가능
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* 헤더 */}
      <div className="border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Switch Point Calculator</h1>
              <p className="text-sm text-muted-foreground mt-1">
                아이템 제작에 필요한 재료와 포인트를 계산합니다
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* 뷰 모드 전환 */}
              <div className="flex items-center rounded-lg border p-1">
                <Button
                  variant={viewMode === "dashboard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => changeViewMode("dashboard")}
                  className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  대시보드
                </Button>
                <Button
                  variant={viewMode === "detail" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => changeViewMode("detail")}
                  className="gap-2">
                  <ListFilter className="h-4 w-4" />
                  상세편집
                </Button>
              </div>

              {/* 데이터 관리 */}
              {/* <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="gap-2">
                  <Download className="h-4 w-4" />
                  내보내기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2">
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
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="container mx-auto py-6">
        {viewMode === "dashboard" ? (
          <CharacterDashboard
            changeViewMode={changeViewMode}
            {...props}
          />
        ) : (
          <CharacterDetail {...props} />
        )}
      </div>
    </div>
  );
}
