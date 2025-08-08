// components/ui/data-table/components/table-data-cell.tsx
"use client";
import React from "react";
import { Column, Table, flexRender } from "@tanstack/react-table";
import { TableCell } from "@/components/base/table";
import { Input } from "@/components/base/input";
import { Textarea } from "@/components/base/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { Badge } from "@/components/base/badge";
import { useDataTableContext } from "../contexts/data-table-context";
import { analyzeColumn } from "../utils/column-utils";
import { cn } from "@/lib/utils";
import { SYSTEM_COLUMN_IDS } from "../constants";

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

// Helper function for rendering custom cell content
const renderCustomContent = (column: any, row: any, value: any, table: any) => {
  if (!column.columnDef.cell) {
    return value || <span className="text-muted-foreground">-</span>;
  }

  return flexRender(column.columnDef.cell, {
    row,
    column,
    table,
    getValue: () => value,
    renderValue: () => value,
    cell: { getValue: () => value },
  });
};

// Cell renderers object (like dropdown pattern)
const cellRenderers = {
  // System column renderer
  system: ({ column, row, value, table }: any) => (
    <div className="flex items-center justify-center">
      {renderCustomContent(column, row, value, table) || "-"}
    </div>
  ),

  // Read-only cell renderer
  readonly: ({ column, row, value, table }: any) => (
    <div className="px-2">
      <p className="border border-transparent px-3">
        {renderCustomContent(column, row, value, table)}
      </p>
    </div>
  ),

  // Text input renderer
  text: ({ value, placeholder, autoFocus, onChange }: any) => (
    <Input
      className=""
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  ),

  // Number input renderer
  number: ({ value, placeholder, autoFocus, onChange }: any) => (
    <Input
      type="number"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  ),

  // Textarea renderer
  textarea: ({ value, placeholder, autoFocus, onChange }: any) => (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  ),

  // Select renderer
  select: ({ value, placeholder, onChange, meta }: any) => {
    if (!meta.editOptions?.length) {
      return (
        <Badge
          variant="destructive"
          className="text-xs">
          No options
        </Badge>
      );
    }

    const selected = meta.editOptions.find((opt: any) => opt.value === value);

    return (
      <Select
        value={value || ""}
        onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`${placeholder} 선택`}>
            {selected?.label && <span className="">{selected.label}</span>}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {meta.editOptions.map((opt: any) => (
            <SelectItem
              key={opt.value}
              value={opt.value}>
              <span className="">{opt.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};

export function TableDataCell<TData>({ cell, row, table }: TableDataCellProps<TData>) {
  const { isRowEditing, editState, updateCell } = useDataTableContext<TData>();
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

  // Determine which renderer to use
  const getRendererType = () => {
    if (isSystemColumn) return "system";
    if (!canEdit) return "readonly";
    return meta.editType || "text";
  };

  const rendererType = getRendererType();
  const renderer = cellRenderers[rendererType as keyof typeof cellRenderers];

  // Prepare props based on renderer type
  const rendererProps = React.useMemo(() => {
    if (rendererType === "system" || rendererType === "readonly") {
      return { column, row, value, table };
    }

    // Edit mode props
    return {
      value: currentValue,
      placeholder: meta?.displayName || column.id,
      autoFocus: isFirstEditColumn,
      onChange: handleChange,
      meta,
    };
  }, [
    rendererType,
    column,
    row,
    value,
    table,
    currentValue,
    meta,
    isFirstEditColumn,
    handleChange,
  ]);

  // Render the cell content
  const content = renderer(rendererProps);

  // Wrap edit mode content if needed
  const wrappedContent = canEdit ? (
    <div
      className={cn(
        "h-[44px] flex items-center px-2",
        rendererType === "textarea" && "bg-muted/20 border border-input rounded mx-1 px-3"
      )}>
      {content}
    </div>
  ) : (
    content
  );

  return (
    <TableCell
      className={cn("overflow-hidden", cellClassName)}
      style={headerStyle}>
      {wrappedContent}
    </TableCell>
  );
}
