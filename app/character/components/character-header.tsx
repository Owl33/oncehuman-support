"use client";

import React, { useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/base/button";
import { useMobileDetection } from "@/components/ui/data-table/hooks/use-mobile-detection";
import { Plus, Download, Upload, RotateCcw } from "lucide-react";

interface CharacterHeaderProps {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
  onAddCharacter: () => void;
  isEditMode: boolean;
}

export function CharacterHeader({
  onExport,
  onImport,
  onClearAll,
  onAddCharacter,
  isEditMode,
}: CharacterHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isMobile, isTablet } = useMobileDetection();

  const actions = (
    <div className={
      isMobile 
        ? "flex flex-col gap-2 w-full"
        : "flex items-center gap-2"
    }>
      {/* 데이터 관리 버튼들 */}
      <div className={
        isMobile 
          ? "flex gap-2 w-full"
          : "flex items-center gap-2"
      }>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className={isMobile ? "flex-1" : ""}>
          <Download className="h-4 w-4 mr-2" />
          내보내기
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className={isMobile ? "flex-1" : ""}>
          <Upload className="h-4 w-4 mr-2" />
          가져오기
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className={isMobile ? "flex-1" : ""}>
          <RotateCcw className="h-4 w-4 mr-2" />
          초기화
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onImport}
        className="hidden"
      />

      {/* 구분선 - 모바일에서는 숨김 */}
      {!isMobile && <div className="w-px h-6 bg-border mx-2" />}

      {/* 캐릭터 추가 버튼 - 모바일에서는 전체 너비 */}
      <Button
        variant="default"
        onClick={onAddCharacter}
        disabled={isEditMode}
        className={isMobile ? "w-full" : ""}>
        <Plus className="h-4 w-4 mr-2" />
        캐릭터 추가
      </Button>
    </div>
  );

  return (
    <PageHeader
      title="캐릭터 관리"
      description="캐릭터를 관리합니다. 현재 데이터는 브라우저에 저장되기에 브라우저 캐시 삭제 시 모든 데이터가 초기화됩니다."
      actions={actions}
    />
  );
}
