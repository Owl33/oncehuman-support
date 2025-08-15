// components/ui/data-table/core/FloatingActionBar.tsx
"use client";
import React, { useMemo, useCallback } from "react";
import { Button } from "@/components/base/button";
import { useDataTableContext } from "../table-state";
import { useMobileDetection } from "../table-features/responsive";
import { cn } from "@/lib/utils";
import { Check, X, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/base/badge";

export function FloatingActionBar() {
  const { table, editState, isInEditMode, startEdit, saveChanges, cancelEdit, onSave, onDelete } =
    useDataTableContext();
  const { isMobile, isTablet } = useMobileDetection();

  // 선택된 행 정보 최적화
  const rowSelection = table?.getState().rowSelection;
  const selectedRows = useMemo(() => {
    if (!table) return [];
    return table.getSelectedRowModel().rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, table]);

  const selectedCount = selectedRows.length;
  const hasErrors = false; // 현재 구조에서는 validation errors가 없음

  // 버튼 활성화 상태
  const canEdit = selectedCount === 1; // 1개만 선택되었을 때만 편집 가능
  const canDelete = selectedCount > 0; // 1개 이상 선택되었을 때 삭제 가능

  // 이벤트 핸들러 최적화
  const handleSave = useCallback(() => {
    const result = saveChanges();
    onSave?.(result);
  }, [saveChanges, onSave]);

  const handleDelete = useCallback(() => {
    if (!selectedCount || !table) return;

    const rowData = selectedRows.map((row) => row.original);
    onDelete?.(rowData);
  }, [selectedCount, selectedRows, table, onDelete]);

  const handleClearSelection = useCallback(() => {
    if (!table) return;
    table.setRowSelection({});
  }, [table]);

  // 조건 체크
  if (!table || (!isInEditMode && selectedCount === 0)) return null;

  // 스타일 클래스 최적화
  const containerClasses = cn(
    "z-50 pointer-events-auto fixed",
    // 모바일에서는 하단 고정, 데스크톱에서는 상단 여백과 함께 배치
    isMobile || isTablet
      ? " bottom-4 left-1/2 transform -translate-x-1/2"
      : " mb-4 flex justify-center top-[11vh]"
  );

  const barClasses = cn(
    "flex items-center gap-3 px-4 py-2 bg-background/95 backdrop-blur-sm",
    "border border-border/50 rounded-lg shadow-lg",
    "transition-all duration-200 ease-in-out",
    "animate-in slide-in-from-bottom-2 fade-in-0 duration-300",
    // 모바일에서 너비 조정
    isMobile || isTablet ? "w-[90vw] max-w-md" : "w-auto"
  );

  return (
    <div className={containerClasses}>
      <div className={barClasses}>
        {isInEditMode ? (
          // Edit mode
          <>
            <div className=" flex items-center gap-2 text-sm text-muted-foreground">
              {hasErrors && <AlertCircle className="h-4 w-4 text-destructive" />}
              편집 모드
              {editState.editMode === "add" && (
                <Badge
                  variant="secondary"
                  className="text-xs">
                  새 항목
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-1.5 h-8 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <Check className="h-4 w-4" />
              저장
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              className="gap-1.5 h-8 transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive">
              <X className="h-4 w-4" />
              취소
            </Button>
          </>
        ) : (
          // Selection mode
          <>
            <Badge
              variant="secondary"
              className="text-sm cursor-pointer hover:bg-secondary/80 transition-colors duration-200 flex items-center gap-1.5"
              onClick={handleClearSelection}>
              <span>
                {selectedCount}개 선택됨
                {/* {selectedCount > 1 && <span className="text-xs ml-1">(편집은 1개씩만 가능)</span>} */}
              </span>
              <X className="h-3 w-3" />
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={startEdit}
              disabled={!canEdit}
              className="gap-1.5 h-8 transition-colors duration-200 hover:bg-[var(--selection)] hover:text-[var(--selection-foreground)] disabled:opacity-50">
              <Edit2 className="h-4 w-4" />
              수정
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={!canDelete}
                className="gap-1.5 h-8 text-destructive transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
                삭제
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
