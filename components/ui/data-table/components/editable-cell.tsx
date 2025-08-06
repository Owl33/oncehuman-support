// components/ui/data-table/components/editable-cell.tsx
"use client";
import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import { Input } from "@/components/base/input";
import { Textarea } from "@/components/base/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { useDataTableContext } from "../contexts/data-table-context";
import { cn } from "@/lib/utils";
import { SYSTEM_COLUMN_IDS, EDITABLE_CELL_HEIGHT } from "../constants";
import { Badge } from "@/components/base/badge";

interface EditableCellProps<TData> {
  row: any;
  column: any;
  value: any;
  table: ReactTable<TData>;
}

export function EditableCell<TData>({ row, column, value, table }: EditableCellProps<TData>) {
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
        return (
          <div className="flex items-center justify-center">
            {flexRender(column.columnDef.cell, cellContext)}
          </div>
        );
      }
      return <div className="text-center">{value || "-"}</div>;
    }

    // Regular columns with better styling
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
      return value || <span className="text-muted-foreground">-</span>;
    })();

    return (
      <div className={cn(EDITABLE_CELL_HEIGHT, "flex items-center px-3")}>
        <div className="w-full truncate">{displayContent}</div>
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

  const handleUpdate = (newValue: any) => {
    updateCell(row.id, column.id, newValue);
  };

  switch (meta.editType) {
    case "textarea":
      return (
        <div className="py-2 px-3">
          <Textarea
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            className={cn(
              "min-h-[80px] resize-none",
              "focus:ring-2 focus:ring-primary/20"
            )}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
          />
        </div>
      );

    case "select":
      if (!meta.editOptions || meta.editOptions.length === 0) {
        console.warn(`No options provided for select column: ${column.id}`);
        return (
          <div className="flex items-center px-3 py-2">
            <Badge variant="destructive" className="text-xs">
              No options available
            </Badge>
          </div>
        );
      }

      return (
        <div className="py-1 px-3">
          <Select
            value={currentValue || ""}
            onValueChange={handleUpdate}
          >
            <SelectTrigger 
              className={cn(
                "h-9",
                "focus:ring-2 focus:ring-primary/20",
                isFirstEditCell && "ring-2 ring-primary/20"
              )}
            >
              <SelectValue placeholder={`${placeholder} 선택`} />
            </SelectTrigger>
            <SelectContent>
              {meta.editOptions.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "number":
      return (
        <div className="py-1 px-3">
          <Input
            type="number"
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
            className={cn(
              "h-9",
              "focus:ring-2 focus:ring-primary/20",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />
        </div>
      );

    case "text":
    default:
      return (
        <div className="py-1 px-3">
          <Input
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
            className={cn(
              "h-9",
              "focus:ring-2 focus:ring-primary/20"
            )}
          />
        </div>
      );
  }
}