// components/ui/data-table/components/table-header-cell.tsx
"use client";
import { flexRender, Header } from "@tanstack/react-table";
import { TableHead } from "@/components/base/table";
import { cn } from "@/lib/utils";
import { analyzeColumn } from "../utils/column-utils";
import { EDITABLE_CELL_HEIGHT } from "../constants";

interface TableHeaderCellProps<TData, TValue> {
  header: Header<TData, TValue>;
}

export function TableHeaderCell<TData, TValue>({ header }: TableHeaderCellProps<TData, TValue>) {
  const { isSystemColumn, cellClassName, headerStyle } = analyzeColumn(header.column);

  return (
    <TableHead
      className={cellClassName}
      style={headerStyle}>
      {header.isPlaceholder ? null : (
        <>
          {isSystemColumn ? (
            flexRender(header.column.columnDef.header, header.getContext())
          ) : (
            <div className={cn(EDITABLE_CELL_HEIGHT, "flex items-center px-2")}>
              <p className="border border-transparent px-3">
                {flexRender(header.column.columnDef.header, header.getContext())}
              </p>
            </div>
          )}
        </>
      )}
    </TableHead>
  );
}
