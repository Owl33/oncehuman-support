"use client";

import React, { useRef } from "react";
import { Button } from "@/components/base/button";
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

  return (
    <div className="border-b">
      <div className="mx-auto py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">캐릭터 관리</h1>
            <p className=" text-muted-foreground mt-1">
              캐릭터를 관리합니다. 현재 데이터는 브라우저에 저장되기에 브라우저 캐시 삭제 시 모든
              데이터가 초기화됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* 데이터 관리 버튼들 */}
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              내보내기
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              가져오기
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}>
              <RotateCcw className="h-4 w-4 mr-2" />
              초기화
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            {/* 캐릭터 추가 버튼 */}
            <Button
              variant="default"
              onClick={onAddCharacter}
              disabled={isEditMode}>
              <Plus className="h-4 w-4 mr-2" />
              캐릭터 추가
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
