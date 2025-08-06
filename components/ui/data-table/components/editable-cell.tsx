// components/ui/data-table/components/editable-cell.tsx
"use client";
import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { Input } from "@/components/base/input";
import { useDataTableContext } from "../context/data-table-context";
import { cn } from "@/lib/utils";
import { SYSTEM_COLUMN_IDS, EDITABLE_CELL_HEIGHT } from "../constants";

interface EditableCellProps<TData> {
  row: any;
  column: any;
  value: any;
  table: ReactTable<TData>;
}

export const EditableCell = <TData,>({ row, column, value, table }: EditableCellProps<TData>) => {
  const { isRowEditing, editState, updateCell } = useDataTableContext<TData>();

  const meta = column.columnDef.meta;
  const isEditing = isRowEditing(row.id);
  const editingValue = editState.editingData[row.id]?.[column.id];
  const currentValue = editingValue ?? value;

  const isSystemColumn = SYSTEM_COLUMN_IDS.includes(column.id as any);

  // Non-editable or system columns
  if (!isEditing || !meta?.editable || isSystemColumn) {
    // System columns keep original rendering
    if (isSystemColumn) {
      if (column.columnDef.cell) {
        const cellContext = {
          row,
          column,
          getValue: () => value,
          table,
          renderValue: () => value,
          cell: { getValue: () => value },
        };
        return flexRender(column.columnDef.cell, cellContext);
      }
      return value || "-";
    }

    // Regular columns wrapped for consistent height
    const displayContent = (() => {
      if (column.columnDef.cell) {
        const cellContext = {
          row,
          column,
          getValue: () => value,
          table,
          renderValue: () => value,
          cell: { getValue: () => value },
        };
        return flexRender(column.columnDef.cell, cellContext);
      }
      return value || "-";
    })();

    return (
      <div className={cn(EDITABLE_CELL_HEIGHT, "flex items-center px-3 py-1")}>
        <span className="py-1">{displayContent}</span>
      </div>
    );
  }

  // Edit mode rendering
  const placeholder = meta.displayName || column.id;

  const getFirstEditableColumnId = () => {
    return table
      .getAllColumns()
      .filter((col) => col.columnDef.meta?.editable && !SYSTEM_COLUMN_IDS.includes(col.id as any))[0]
      ?.id;
  };

  const isFirstEditCell = isEditing && column.id === getFirstEditableColumnId();
  const commonClasses = "w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const handleUpdate = (newValue: any) => {
    updateCell(row.id, column.id, newValue);
  };

  switch (meta.editType) {
    case "textarea":
      return (
        <div className="py-1">
          <textarea
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            className={cn(commonClasses, "p-2 border rounded min-h-[60px] resize-none")}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
          />
        </div>
      );

    case "select":
      if (!meta.editOptions || meta.editOptions.length === 0) {
        console.warn(`No options provided for select column: ${column.id}`);
        return (
          <div className="flex items-center px-3 py-1">
            <span className="text-red-500">No options available</span>
          </div>
        );
      }

      return (
        <div className="py-1">
          <select
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            className={cn(commonClasses, "px-3 border rounded bg-white dark:bg-gray-800")}
            autoFocus={isFirstEditCell}
          >
            <option value="">선택하세요</option>
            {meta.editOptions.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "number":
      return (
        <div className="py-1">
          <Input
            type="number"
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
          />
        </div>
      );

    case "text":
    default:
      return (
        <div className="py-1">
          <Input
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
          />
        </div>
      );
  }
}