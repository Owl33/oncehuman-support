// components/ui/data-table/components/floating-action-bar.tsx
"use client";
import { useMemo } from "react";
import { Button } from "@/components/base/button";
import { Card, CardContent } from "@/components/base/card";
import { useDataTableContext } from "../context/data-table-context";
import { cn } from "@/lib/utils";
import { Check, X, Edit, Trash } from "lucide-react";

export function FloatingActionBar() {
  const {
    table,
    editState,
    isInEditMode,
    startEdit,
    saveChanges,
    cancelEdit,
    onSave,
    onDelete,
  } = useDataTableContext();

  if (!table) return null;

  const selectedRowIds = useMemo(
    () => Object.keys(table.getState().rowSelection),
    [table.getState().rowSelection]
  );

  const selectedCount = selectedRowIds.length;

  // Hide if nothing selected and not in edit mode
  if (!isInEditMode && selectedCount === 0) {
    return null;
  }

  const clearSelection = () => {
    table.setRowSelection({});
  };

  const handleSave = () => {
    const result = saveChanges();
    onSave?.(result);
  };

  const handleDelete = () => {
    const selectedRows = table.getRowModel().rows.filter((row) => selectedRowIds.includes(row.id));
    const deletedData = selectedRows.map((row) => row.original);
    onDelete?.(deletedData);
    table.setRowSelection({});
  };

  // Display text
  const getDisplayText = () => {
    switch (editState.editMode) {
      case "add":
        return "새 행 추가 중";
      case "edit":
        return "편집 중";
      default:
        return `${selectedCount}개 선택됨`;
    }
  };

  // Button states
  const canEdit = !isInEditMode && selectedCount === 1;
  const canDelete = !isInEditMode && selectedCount > 0;

  return (
    <div className="fixed top-52 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5">
      <Card className="p-2 shadow-lg border-muted bg-popover dark:bg-muted">
        <CardContent className="px-2 flex items-center gap-4">
          <div
            onClick={!isInEditMode ? clearSelection : undefined}
            className={cn(
              "text-blue-400 text-sm font-medium",
              !isInEditMode && "cursor-pointer hover:underline"
            )}
          >
            {getDisplayText()}
          </div>

          {isInEditMode ? (
            // Edit mode buttons
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={handleSave}>
                <Check className="h-4 w-4" />
                저장
              </Button>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X className="h-4 w-4" />
                취소
              </Button>
            </div>
          ) : (
            // Normal mode buttons
            <div className="flex gap-2">
              <Button disabled={!canEdit} variant="outline" size="sm" onClick={startEdit}>
                <Edit className="h-4 w-4" />
                편집
              </Button>
              <Button disabled={!canDelete} variant="destructive" size="sm" onClick={handleDelete}>
                <Trash className="h-4 w-4" />
                삭제
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}