"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TableRow, TableCell } from "@/components/base/table";
import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils";
import { useDataTableContext } from "../../contexts/data-table-context";
import { useMobileDetection } from "../../hooks/use-mobile-detection";
import { DataTableRowCell } from "../main/row-cell";
import { categorizeColumnsByPriority } from "../../utils/column-priority";
import { SYSTEM_COLUMN_IDS } from "../../constants";
import { CellRendererFactory, CellRendererType } from "../../utils/cell-renderer-factory";
import { Edit2, Trash2, Check, X } from "lucide-react";

interface CollapsibleTableRowProps<TData> {
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

export function CollapsibleTableRow<TData>({
  row,
  table,
  isCollapseMode,
  isExpanded = false,
  onToggleExpand,
}: CollapsibleTableRowProps<TData>) {
  const {
    isRowEditing,
    editState,
    updateCell,
    startEdit,
    startEditRow,
    onDelete,
    saveChanges,
    cancelEdit,
    onSave,
  } = useDataTableContext<TData>();
  const { isMobile, isTablet } = useMobileDetection();

  const isEditing = isRowEditing(row.id);
  const isNewRow = row.id === editState.tempRowId;

  // Auto-expand when editing (notify parent component)
  useEffect(() => {
    if ((isEditing || isNewRow) && !isExpanded && onToggleExpand) {
      onToggleExpand(row.id);
    }
  }, [isEditing, isNewRow, isExpanded, onToggleExpand, row.id]);

  if (!isCollapseMode) {
    // Desktop mode: render normal row
    return (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected?.() ? "selected" : undefined}
        className={cn(
          "hover:bg-muted/50 transition-colors",
          isEditing && "bg-muted/30",
          isNewRow && "bg-[var(--selection)]/30 hover:bg-[var(--selection)]/40"
        )}>
        {renderRowCells()}
      </TableRow>
    );
  }

  // Mobile/tablet collapse mode
  const allColumns = table?.getAllColumns() || [];
  const { primaryColumns, secondaryColumns, systemColumns } =
    categorizeColumnsByPriority(allColumns);

  const visibleColumns = [...systemColumns, ...primaryColumns];

  // Helper function to render cell content without TableCell wrapper for expanded area
  function renderCellContentOnly(cell: any, row: any, table: any) {
    const column = cell.column;
    const value = cell.getValue();
    const meta = column.columnDef.meta;
    const isSystemColumn = SYSTEM_COLUMN_IDS.includes(column.id as any);
    const canEdit = isEditing && meta?.editable && !isSystemColumn;

    // Get current value for editing
    const currentValue = canEdit ? editState.editingData[row.id]?.[column.id] ?? value : value;

    // Determine renderer type
    const rendererType: CellRendererType = canEdit
      ? ((meta.editType || "text") as CellRendererType)
      : "readonly";

    // Update handler
    const handleChange = (newValue: any) => {
      updateCell(row.id, column.id, newValue);
    };

    // Use factory to render content
    return CellRendererFactory.render(rendererType, {
      value,
      currentValue,
      placeholder: meta?.displayName || column.id,
      onChange: handleChange,
      meta,
      column,
      row,
      table,
    });
  }

  function renderRowCells() {
    const cells =
      row.getVisibleCells?.() ||
      table
        .getAllColumns()
        .filter((column: any) => column.getIsVisible())
        .map((column: any) => ({
          id: column.id,
          column,
          getValue: () =>
            isNewRow ? editState.editingData[editState.tempRowId]?.[column.id] || "" : "",
        }));

    return cells.map((cell: any) => (
      <DataTableRowCell
        key={cell.id}
        cell={cell}
        row={row}
        table={table}
      />
    ));
  }

  function renderCollapsibleCells() {
    const cells = visibleColumns.map((column: any) => {
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
        <DataTableRowCell
          key={cell.id}
          cell={cell}
          row={row}
          table={table}
        />
      );
    });

    // Add expand button cell for collapse mode
    if (isCollapseMode && (isMobile || isTablet)) {
      const expandCell = (
        <TableCell
          key="expand"
          className="w-[60px] p-2">
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onToggleExpand) {
                  onToggleExpand(row.id);
                }
              }}
              className="h-8 w-8 p-0"
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
  }

  function renderExpandedContent() {
    if (secondaryColumns.length === 0) return null;

    // Calculate correct colSpan including expand button
    const totalColumns = visibleColumns.length + (isCollapseMode && (isMobile || isTablet) ? 1 : 0);

    return (
      <TableRow
        className={cn(
          "bg-muted/20 border-t-0 overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "animate-in slide-in-from-top-1" : "animate-out slide-out-to-top-1"
        )}
        style={{
          display: isExpanded ? "table-row" : "none",
        }}>
        <TableCell
          colSpan={totalColumns}
          className="p-4">
          <div
            className={cn(
              "space-y-3 transition-all duration-300 ease-in-out",
              isExpanded ? "opacity-100 transform-none" : "opacity-0 -translate-y-2"
            )}>
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
                  <div className="text-sm p-2 bg-background rounded border min-h-[36px] flex items-center">
                    {renderCellContentOnly(cell, row, table)}
                  </div>
                </div>
              );
            })}

            {/* Individual Action Buttons in expanded area */}
            {!isNewRow && (isMobile || isTablet) && (
              <div className="flex flex-col gap-2 mt-4 pt-3 border-t w-full">
                {isEditing ? (
                  // Edit mode: Show Save/Cancel buttons
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      onClick={() => {
                        const result = saveChanges();
                        onSave?.(result);
                      }}
                      className="flex-1 gap-1.5 h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Check className="h-4 w-4" />
                      완료
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                      className="flex-1 gap-1.5 h-10">
                      <X className="h-4 w-4" />
                      취소
                    </Button>
                  </div>
                ) : (
                  // Normal mode: Show Edit/Delete buttons
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Start editing this specific row directly
                        startEditRow(row.id);
                      }}
                      className="flex-1 gap-1.5 h-10">
                      <Edit2 className="h-4 w-4" />
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Delete this specific row
                        if (row.original && onDelete) {
                          onDelete([row.original]);
                        }
                      }}
                      className="flex-1 gap-1.5 h-10 text-destructive hover:bg-destructive/10 hover:text-destructive">
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

  return (
    <>
      <TableRow
        key={row.id}
        data-state={row.getIsSelected?.() ? "selected" : undefined}
        className={cn(
          "hover:bg-muted/50 transition-colors",
          isEditing && "bg-muted/30",
          isNewRow && "bg-[var(--selection)]/30 hover:bg-[var(--selection)]/40",
          isExpanded && "border-b-0"
        )}>
        {renderCollapsibleCells()}
      </TableRow>
      {renderExpandedContent()}
    </>
  );
}
