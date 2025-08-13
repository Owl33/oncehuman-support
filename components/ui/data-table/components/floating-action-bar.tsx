// components/ui/data-table/components/floating-action-bar.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/base/button";
import { useDataTableContext } from "../contexts/data-table-context";
import { cn } from "@/lib/utils";
import { Check, X, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/base/badge";

export function FloatingActionBar() {
  const { table, editState, isInEditMode, startEdit, saveChanges, cancelEdit, onSave, onDelete } =
    useDataTableContext();

  // State to force re-renders when table selection changes
  const [, forceUpdate] = useState({});

  // Subscribe to table state changes
  useEffect(() => {
    if (!table) return;

    // Subscribe to selection changes by polling table state
    const interval = setInterval(() => {
      forceUpdate({});
    }, 100); // Check every 100ms

    return () => clearInterval(interval);
  }, [table]);

  if (!table) return null;

  const rowSelection = table.getState().rowSelection;
  const selectedRowIds = Object.keys(rowSelection).filter((id) => rowSelection[id] === true);
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

  const containerClasses = cn(
    "absolute -top-12 left-38 transform -translate-x-1/2 z-50 pointer-events-auto"
  );

  const barClasses = cn(
    // Background & Backdrop
    "bg-gradient-to-r from-primary/8 via-background/95 to-primary/8",
    "backdrop-blur supports-[backdrop-filter]:bg-background/90",
    
    // Border & Shadow
    "border-2 border-primary/20 rounded-lg shadow-xl",
    "ring-1 ring-primary/10 ring-inset",
    
    // Layout & Spacing
    "px-4 py-2 flex items-center gap-3",
    
    // Animation & Interaction
    "animate-in slide-in-from-top-5 duration-200",
    "hover:shadow-2xl hover:border-primary/30 transition-all duration-300",
    "pointer-events-auto"
  );

  return (
    <div className={containerClasses}>
      <div className={barClasses}>
        {/* Status Badge */}
        <Badge
          variant={display.variant}
          className={cn(
            "gap-1.5 px-3 py-1 font-medium",
            !isInEditMode && [
              "cursor-pointer transition-colors duration-200",
              "hover:bg-[var(--selection)] hover:text-[var(--selection-foreground)]"
            ],
            display.variant === "secondary" && [
              "bg-[var(--selection)] text-[var(--selection-foreground)]",
              "border-[var(--selection-foreground)]/20 shadow-sm"
            ]
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
              className={cn(
                "gap-1.5 h-8 shadow-sm",
                "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}>
              <Check className="h-4 w-4" />
              저장
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              className={cn(
                "gap-1.5 h-8 transition-colors duration-200",
                "hover:bg-destructive/10 hover:text-destructive"
              )}>
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
              className={cn(
                "gap-1.5 h-8 transition-colors duration-200",
                "hover:bg-[var(--selection)] hover:text-[var(--selection-foreground)]",
                "disabled:opacity-50"
              )}>
              <Edit2 className="h-4 w-4" />
              편집
            </Button>
            <Button
              disabled={!canDelete}
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className={cn(
                "gap-1.5 h-8 text-destructive transition-colors duration-200",
                "hover:bg-destructive/10 hover:text-destructive",
                "disabled:opacity-50"
              )}>
              <Trash2 className="h-4 w-4" />
              삭제
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
