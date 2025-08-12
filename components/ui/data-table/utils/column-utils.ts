// components/ui/data-table/utils/column-utils.ts
"use client";
import { Column } from "@tanstack/react-table";
import { getColumnWidth } from "./column-width";
import { SYSTEM_COLUMN_IDS } from "../constants";
import { cn } from "@/lib/utils";

export interface ColumnAnalysis {
  isSystemColumn: boolean;
  headerStyle: React.CSSProperties;
  cellClassName: string;
}

/**
 * 컬럼을 분석하여 렌더링에 필요한 모든 정보를 반환
 */
export function analyzeColumn<TData, TValue>(column: Column<TData, TValue>): ColumnAnalysis {
  const isSystemColumn = SYSTEM_COLUMN_IDS.includes(column.id as any);
  const widthResult = getColumnWidth(column);

  return {
    isSystemColumn,
    headerStyle: {
      ...widthResult.style,
      boxSizing: 'border-box' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    cellClassName: widthResult.className,
  };
}

/**
 * 테이블의 컬럼들을 고정/자동으로 분류 (간소화)
 */
export function categorizeColumns<TData>(columns: Column<TData, any>[]) {
  const fixedColumns = columns.filter((col) => {
    const isSystemColumn = SYSTEM_COLUMN_IDS.includes(col.id as any);
    const hasWidth = col.columnDef.meta?.width;
    return isSystemColumn || hasWidth;
  });

  const autoColumns = columns.filter((col) => {
    const isSystemColumn = SYSTEM_COLUMN_IDS.includes(col.id as any);
    const hasWidth = col.columnDef.meta?.width;
    return !isSystemColumn && !hasWidth;
  });

  return {
    fixedColumns,
    autoColumns,
    fixedWidth: 0, // 더 이상 계산하지 않음
    hasFixedColumns: fixedColumns.length > 0,
    autoColumnsCount: autoColumns.length,
  };
}