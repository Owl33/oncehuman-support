// components/ui/data-table/table-layout/components/ResponsiveTableRow.tsx
"use client";
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Edit2, Trash2, Check, X } from "lucide-react";
import { TableRow, TableCell } from "@/components/base/table";
import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils";
import { useDataTableContext } from "../../table-state";
import { useMobileDetection, useRowSwipeActions } from "../../table-features/responsive";
import { ColumnManager } from "../../table-columns";
import { DataTableCell } from "./DataTableCell";

interface ResponsiveTableRowProps<TData> {
  row: {
    id: string;
    original?: TData;
    getIsSelected?: () => boolean;
    getVisibleCells?: () => any[];
  };
  table: any;
  isCollapseMode: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (rowId: string) => void;
}

export function ResponsiveTableRow<TData>({
  row,
  table,
  isCollapseMode,
  isExpanded = false,
  onToggleExpand,
}: ResponsiveTableRowProps<TData>) {
  const {
    isRowEditing,
    editState,
    startEditRow,
    onDelete,
    saveChanges,
    cancelEdit,
    onSave,
    updateCell,
  } = useDataTableContext<TData>();

  const { isMobile, isTablet } = useMobileDetection();
  const isEditing = isRowEditing(row.id);
  const isNewRow = row.id === editState.tempRowId;

  // 편집/추가 모드일 때 자동 확장
  useEffect(() => {
    if ((isEditing || isNewRow) && !isExpanded && onToggleExpand) {
      onToggleExpand(row.id);
    }
  }, [isEditing, isNewRow, isExpanded, onToggleExpand, row.id]);

  // 터치 제스처 설정
  const swipeHandlers = useRowSwipeActions({
    onSwipeLeftAction: () => {
      // 왼쪽 스와이프: 삭제
      if (!isEditing && row.original && onDelete) {
        onDelete([row.original]);
      }
    },
    onSwipeRightAction: () => {
      // 오른쪽 스와이프: 편집
      if (!isEditing) {
        startEditRow(row.id);
      }
    },
    onDoubleTapAction: () => {
      // 더블탭: 확장 토글
      if (onToggleExpand && isCollapseMode) {
        onToggleExpand(row.id);
      }
    },
  });

  // 모든 모드 통합: 단일 구조로 처리
  const allColumns = table?.getAllColumns() || [];
  const { primaryColumns, secondaryColumns, systemColumns } =
    ColumnManager.categorizeByPriority(allColumns);

  const visibleColumns = [...systemColumns, ...primaryColumns];

  // 표시할 컬럼들 결정
  const columnsToRender = isCollapseMode ? visibleColumns : 
    table.getAllColumns().filter((column: any) => column.getIsVisible());

  // 셀들 렌더링
  const renderCells = () => {
    const cells = columnsToRender.map((column: any) => {
      const cell = {
        id: column.id,
        column,
        getValue: () => {
          if (isNewRow) {
            return editState.editingData[editState.tempRowId]?.[column.id] || "";
          }
          return (row.original as any)?.[column.id] || "";
        },
      };

      return (
        <DataTableCell
          key={cell.id}
          cell={cell}
          row={row}
          table={table}
        />
      );
    });

    // 콜랩스 모드일 때 확장 버튼 추가
    if (isCollapseMode && (isMobile || isTablet)) {
      const expandCell = (
        <TableCell key="expand" className="w-[60px] px-3 py-2">
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand?.(row.id)}
              className="h-8 w-8 p-0 touch-manipulation"
              disabled={isEditing}
              aria-label={isExpanded ? "행 축소" : "행 확장"}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </TableCell>
      );
      cells.push(expandCell);
    }

    return cells;
  };


  function renderExpandedContent() {
    if (secondaryColumns.length === 0) return null;

    const totalColumns = visibleColumns.length + (isCollapseMode && (isMobile || isTablet) ? 1 : 0);

    return (
      <TableRow
        className={cn(
          "bg-muted/20 border-t-0 overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "animate-in slide-in-from-top-1" : "animate-out slide-out-to-top-1"
        )}
        style={{ display: isExpanded ? "table-row" : "none" }}>
        <TableCell
          colSpan={totalColumns}
          className="px-3 py-4">
          <div
            className={cn(
              "space-y-3 transition-all duration-300 ease-in-out",
              isExpanded ? "opacity-100 transform-none" : "opacity-0 -translate-y-2"
            )}>
            {/* 보조 컬럼들 */}
            {secondaryColumns.map((column: any) => {
              const cell = {
                id: column.id,
                column,
                getValue: () => {
                  if (isNewRow) {
                    return editState.editingData[editState.tempRowId]?.[column.id] || "";
                  }
                  return (row.original as any)?.[column.id] || "";
                },
              };

              const displayName = column.columnDef?.meta?.displayName || column.id;
              return (
                <div
                  key={column.id}
                  className="flex flex-col space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">{displayName}</label>
                  <div className="h-9 flex items-center">
                    <DataTableCell
                      layout="minimal"
                      cell={cell}
                      row={row}
                      table={table}
                    />
                  </div>
                </div>
              );
            })}

            {/* 모바일 액션 버튼들 */}
            {!isNewRow && (isMobile || isTablet) && (
              <div className="flex flex-col gap-2 mt-4 pt-3 border-t w-full">
                {isEditing ? (
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      onClick={() => {
                        const result = saveChanges();
                        onSave?.(result);
                      }}
                      className="flex-1 gap-1.5 h-10 bg-primary hover:bg-primary/90 text-primary-foreground touch-manipulation">
                      <Check className="h-4 w-4" />
                      완료
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      className="flex-1 gap-1.5 h-10 touch-manipulation">
                      <X className="h-4 w-4" />
                      취소
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditRow(row.id)}
                      className="flex-1 gap-1.5 h-10 touch-manipulation">
                      <Edit2 className="h-4 w-4" />
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (row.original && onDelete) {
                          onDelete([row.original]);
                        }
                      }}
                      className="flex-1 gap-1.5 h-10 text-destructive hover:bg-destructive/10 hover:text-destructive touch-manipulation">
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // 통합된 구조: 모든 모드에서 동일한 패턴 사용
  return (
    <>
      <TableRow
        key={row.id}
        data-state={row.getIsSelected?.() ? "selected" : undefined}
        className={cn(
          "hover:bg-muted/50 transition-colors select-none",
          isEditing && "bg-secondary/20 hover:bg-secondary/30",
          isNewRow && "bg-[var(--selection)]/30 hover:bg-[var(--selection)]/40",
          isExpanded && isCollapseMode && "border-b-0"
        )}
        {...swipeHandlers}>
        {renderCells()}
      </TableRow>
      {isCollapseMode && renderExpandedContent()}
    </>
  );
}
