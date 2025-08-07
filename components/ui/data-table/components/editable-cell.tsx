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

  // Select 옵션에서 label 찾기

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
      // cell 함수가 정의되어 있으면 그것을 사용
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
      <div className="h-[44px] flex items-center px-3  overflow-hidden">
        <div className="truncate  w-full">{displayContent}</div>
      </div>
    );
  }

  // Edit mode rendering
  const placeholder = meta.displayName || column.id;

  const getFirstEditableColumnId = () => {
    return table
      .getAllColumns()
      .filter(
        (col) => col.columnDef.meta?.editable && !SYSTEM_COLUMN_IDS.includes(col.id as any)
      )[0]?.id;
  };

  const isFirstEditCell = isEditing && column.id === getFirstEditableColumnId();

  const handleUpdate = (newValue: any) => {
    updateCell(row.id, column.id, newValue);
  };

  switch (meta.editType) {
    case "textarea":
      return (
        <div className="h-[44px] flex items-center px-3 bg-muted/20 border border-input rounded mx-1">
          <Textarea
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
            className="h-full w-full resize-none   bg-transparent focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
          />
        </div>
      );

    case "select":
      if (!meta.editOptions || meta.editOptions.length === 0) {
        console.warn(`No options provided for select column: ${column.id}`);
        return (
          <div className="flex items-center  py-2">
            <Badge
              variant="destructive"
              className="text-xs">
              No options available
            </Badge>
          </div>
        );
      }

      // 디버깅: 현재 값과 옵션 확인
      console.log("Select Debug:", {
        currentValue,
        options: meta.editOptions,
        columnId: column.id,
        matchedOption: meta.editOptions.find((opt: any) => opt.value === currentValue),
      });

      // 현재 값에 해당하는 label 찾기
      const selectedOption = meta.editOptions.find((opt: any) => opt.value === currentValue);
      const displayText = selectedOption?.label || "";

      return (
        <div className="h-[44px] flex items-center ">
          <Select
            value={currentValue || ""}
            onValueChange={handleUpdate}>
            <SelectTrigger className="w-full ">
              <SelectValue
                placeholder={`${placeholder} 선택`}
                className="text-foreground truncate">
                {displayText && <span className="text-foreground truncate">{displayText}</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {meta.editOptions.map((option: any) => (
                <SelectItem
                  key={option.value}
                  value={option.value}>
                  <span className="truncate">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "number":
      return (
        <div className="h-[44px] flex items-center ">
          <Input
            type="number"
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
            className=" bg-transparent focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
          />
        </div>
      );

    case "text":
    default:
      return (
        <div className="h-[44px] flex items-center ">
          <Input
            value={currentValue || ""}
            onChange={(e) => handleUpdate(e.target.value)}
            placeholder={placeholder}
            autoFocus={isFirstEditCell}
            className="  bg-transparent focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
          />
        </div>
      );
  }
}
