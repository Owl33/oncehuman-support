// components/ui/data-table/components/table-header-cell.tsx
"use client";
import { flexRender, Header } from "@tanstack/react-table";
import { TableHead } from "@/components/base/table";
import { cn } from "@/lib/utils";
import { analyzeColumn } from "@/components/ui/data-table/utils/column-utils";
import { EDITABLE_CELL_HEIGHT } from "@/components/ui/data-table/constants";

interface TableHeaderCellProps<TData, TValue> {
  header: Header<TData, TValue>;
}

export function DataTableRowHeaderCell<TData, TValue>({
  header,
}: TableHeaderCellProps<TData, TValue>) {
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
            <p className="px-3 border border-transparent h-[36px] flex items-center">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </p>
          )}
        </>
      )}
    </TableHead>
  );
}
