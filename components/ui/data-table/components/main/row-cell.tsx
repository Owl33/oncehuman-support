// components/ui/data-table/components/table-data-cell.tsx
"use client";
import React from "react";
import { Column, Table, flexRender } from "@tanstack/react-table";
import { TableCell } from "@/components/base/table";
import { useDataTableContext } from "@/components/ui/data-table/contexts/data-table-context";
import { useMobileDetection } from "@/components/ui/data-table/hooks/use-mobile-detection";
import { analyzeColumn } from "@/components/ui/data-table/utils/column-utils";
import { TableCellRendererFactory } from "@/components/ui/data-table/utils/table-cell-renderer-factory";
import { cn } from "@/lib/utils";
import { SYSTEM_COLUMN_IDS, EDITABLE_CELL_HEIGHT } from "@/components/ui/data-table/constants";

interface TableDataCellProps<TData> {
  cell: {
    id: string;
    column: Column<TData, any>;
    getValue: () => any;
  };
  row: {
    id: string;
    original?: TData;
    getIsSelected?: () => boolean;
  };
  table: Table<TData>;
}

// Cell rendering logic now handled by TableCellRendererFactory

export function DataTableRowCell<TData>({ cell, row, table }: TableDataCellProps<TData>) {
  const { isRowEditing, editState, updateCell } = useDataTableContext<TData>();
  const { isMobile, isTablet } = useMobileDetection();
  const { cellClassName, headerStyle } = analyzeColumn(cell.column);

  const column = cell.column;
  const value = cell.getValue();
  const meta = column.columnDef.meta;
  const isSystemColumn = SYSTEM_COLUMN_IDS.includes(column.id as any);
  const isEditing = isRowEditing(row.id);
  const canEdit = isEditing && meta?.editable && !isSystemColumn;

  // Get current value
  const currentValue = canEdit ? editState.editingData[row.id]?.[column.id] ?? value : value;

  // Check if first editable column for autofocus
  const isFirstEditColumn = React.useMemo(() => {
    if (!canEdit) return false;
    const firstCol = table
      .getAllColumns()
      .find((col) => col.columnDef.meta?.editable && !SYSTEM_COLUMN_IDS.includes(col.id as any));
    return firstCol?.id === column.id;
  }, [canEdit, column.id, table]);

  // Update handler
  const handleChange = React.useCallback(
    (newValue: any) => {
      updateCell(row.id, column.id, newValue);
    },
    [row.id, column.id, updateCell]
  );

  // Determine renderer type and render content
  const rendererType = isSystemColumn ? "system" : (!canEdit ? "readonly" : "editable");
  
  const content = TableCellRendererFactory.render(rendererType as any, {
    // Common props
    column,
    row,
    value,
    table,
    // Edit props
    currentValue,
    placeholder: meta?.displayName || column.id,
    autoFocus: isFirstEditColumn,
    onChange: handleChange,
    meta,
  });


  return (
    <TableCell
      className={cellClassName}
      style={headerStyle}>
      {content}
    </TableCell>
  );
}
