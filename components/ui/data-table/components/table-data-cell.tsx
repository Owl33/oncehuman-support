// components/ui/data-table/components/table-data-cell.tsx
"use client";
import { Column, Table } from "@tanstack/react-table";
import { TableCell } from "@/components/base/table";
import { EditableCell } from "./editable-cell";
import { analyzeColumn } from "../utils/column-utils";
import { cn } from "@/lib/utils";

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

export function TableDataCell<TData>({ cell, row, table }: TableDataCellProps<TData>) {
  const { cellClassName, headerStyle } = analyzeColumn(cell.column);

  return (
    <TableCell
      className={cn("overflow-hidden", cellClassName)}
      style={headerStyle}>
      <EditableCell
        row={row}
        column={cell.column}
        value={cell.getValue()}
        table={table}
      />
    </TableCell>
  );
}
