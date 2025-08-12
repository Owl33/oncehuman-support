// components/ui/data-table/utils/column-width.ts
"use client";
import { Column } from "@tanstack/react-table";

export interface ColumnWidthResult {
  style: React.CSSProperties;
  className: string;
}

/**
 * 초간단 컬럼 width 설정
 */
export function getColumnWidth<TData, TValue>(
  column: Column<TData, TValue>
): ColumnWidthResult {
  const meta = column.columnDef.meta;
  const style: React.CSSProperties = {};

  // width 설정
  if (meta?.width) {
    style.width = meta.width;
  }

  // minWidth 설정  
  if (meta?.minWidth) {
    style.minWidth = meta.minWidth;
  }

  // maxWidth 설정
  if (meta?.maxWidth) {
    style.maxWidth = meta.maxWidth;
  }

  return {
    style,
    className: ""
  };
}