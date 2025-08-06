// components/ui/data-table/components/floating-action-bar.tsx
"use client";
import { useMemo } from "react";
import { Button } from "@/components/base/button";
import { useDataTableContext } from "../contexts/data-table-context";
import { cn } from "@/lib/utils";
import { Check, X, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/base/badge";

export function FloatingActionBar() {
  const { table, editState, isInEditMode, startEdit, saveChanges, cancelEdit, onSave, onDelete } =
    useDataTableContext();

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

  // Display text and icon
  const getDisplayContent = () => {
    switch (editState.editMode) {
      case "add":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: "새 행 추가 중",
          variant: "default" as const,
        };
      case "edit":
        return {
          icon: <Edit2 className="h-4 w-4" />,
          text: "편집 중",
          variant: "default" as const,
        };
      default:
        return {
          icon: null,
          text: `${selectedCount}개 선택됨`,
          variant: "secondary" as const,
        };
    }
  };

  const display = getDisplayContent();

  // Button states
  const canEdit = !isInEditMode && selectedCount === 1;
  const canDelete = !isInEditMode && selectedCount > 0;

  return (
    <div className="fixed top-48 left-68 transform -translate-x-1/2 z-50">
      <div
        className={cn(
          "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border rounded-lg shadow-lg",
          "px-4 py-2 flex items-center gap-3",
          "animate-in slide-in-from-bottom-5 duration-200"
        )}>
        {/* Status Badge */}
        <Badge
          variant={display.variant}
          className={cn(
            "gap-1.5 px-3 py-1",
            !isInEditMode && "cursor-pointer hover:bg-secondary/80"
          )}
          onClick={!isInEditMode ? clearSelection : undefined}>
          {display.icon}
          <span className="font-medium">{display.text}</span>
          {!isInEditMode && selectedCount > 0 && <X className="h-3 w-3 ml-1 opacity-60" />}
        </Badge>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-border" />

        {/* Action Buttons */}
        {isInEditMode ? (
          // Edit mode buttons
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-1.5 h-8 ">
              <Check className="h-4 w-4" />
              저장
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              className="gap-1.5 h-8 ">
              <X className="h-4 w-4" />
              취소
            </Button>
          </div>
        ) : (
          // Normal mode buttons
          <div className="flex items-center gap-2">
            <Button
              disabled={!canEdit}
              variant="ghost"
              size="sm"
              onClick={startEdit}
              className="gap-1.5 h-8 ">
              <Edit2 className="h-4 w-4" />
              편집
            </Button>
            <Button
              disabled={!canDelete}
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="gap-1.5 h-8  text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              삭제
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
