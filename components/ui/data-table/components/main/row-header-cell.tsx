// components/ui/data-table/components/table-header-cell.tsx
"use client";
import { flexRender, Header } from "@tanstack/react-table";
import { TableHead } from "@/components/base/table";
import { cn } from "@/lib/utils";
import { analyzeColumn } from "@/components/ui/data-table/utils/column-utils";
import { SmartTooltipCell } from "./smart-tooltip-cell";
import { EDITABLE_CELL_HEIGHT } from "@/components/ui/data-table/constants";

interface TableHeaderCellProps<TData, TValue> {
  header: Header<TData, TValue>;
}

export function DataTableRowHeaderCell<TData, TValue>({
  header,
}: TableHeaderCellProps<TData, TValue>) {
  const { isSystemColumn, cellClassName, headerStyle } = analyzeColumn(header.column);
  
  // 헤더 텍스트 추출 (보통 문자열이거나 간단한 컴포넌트)
  const headerText = header.column.columnDef.meta?.displayName || 
                    header.column.id || 
                    String(header.column.columnDef.header || '');

  return (
    <TableHead
      className={cellClassName}
      style={headerStyle}>
      {header.isPlaceholder ? null : (
        <>
          {isSystemColumn ? (
            <div className="w-full flex items-center justify-center">
              <SmartTooltipCell tooltipText={headerText}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </SmartTooltipCell>
            </div>
          ) : (
            <div className="px-3 border border-transparent h-[36px] flex items-center w-full">
              <SmartTooltipCell tooltipText={headerText}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </SmartTooltipCell>
            </div>
          )}
        </>
      )}
    </TableHead>
  );
}
