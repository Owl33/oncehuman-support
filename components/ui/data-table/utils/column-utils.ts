// components/ui/data-table/utils/column-utils.ts
"use client";
import { Column } from "@tanstack/react-table";
import { parseColumnSize, isFixedSizeColumn } from "./column-size-parser";
import { SYSTEM_COLUMN_IDS } from "../constants";
import { cn } from "@/lib/utils";

export interface ColumnAnalysis {
  isSystemColumn: boolean;
  metaClassName: string | undefined;
  isFixedColumn: boolean;
  parsedSize: ReturnType<typeof parseColumnSize> | null;
  headerStyle: React.CSSProperties;
  cellClassName: string;
}

/**
 * 컬럼을 분석하여 렌더링에 필요한 모든 정보를 반환
 */
export function analyzeColumn<TData, TValue>(column: Column<TData, TValue>): ColumnAnalysis {
  const isSystemColumn = SYSTEM_COLUMN_IDS.includes(column.id as any);
  const metaClassName = column.columnDef.meta?.className;
  const isFixedColumn = isSystemColumn || (metaClassName ? isFixedSizeColumn(metaClassName) : false);
  const parsedSize = metaClassName ? parseColumnSize(metaClassName) : null;

  // 스타일 객체 생성
  const headerStyle: React.CSSProperties = {};
  if (isFixedColumn && parsedSize) {
    if (parsedSize.type === "tailwind" && !parsedSize.isFixed) {
      // Tailwind 유틸리티 클래스는 className에 추가
    } else {
      // 고정 크기는 CSS 변수로 설정
      headerStyle["--column-width"] = parsedSize.cssValue;
    }
  }

  // className 생성
  const cellClassName = cn(
    " box-border",
    isFixedColumn ? "table-fixed-column" : "table-auto-column",
    // Tailwind width 클래스 추가 (고정되지 않은 경우)
    parsedSize?.type === "tailwind" && !parsedSize.isFixed
      ? (parsedSize.value as string)
      : ""
  );

  return {
    isSystemColumn,
    metaClassName,
    isFixedColumn,
    parsedSize,
    headerStyle,
    cellClassName,
  };
}

/**
 * 테이블의 컬럼들을 고정/자동으로 분류
 */
export function categorizeColumns<TData>(columns: Column<TData, any>[]) {
  const fixedColumns = columns.filter((col) => {
    const isSystemColumn = SYSTEM_COLUMN_IDS.includes(col.id as any);
    if (isSystemColumn) return true;

    const metaClassName = col.columnDef.meta?.className;
    return metaClassName && isFixedSizeColumn(metaClassName);
  });

  const autoColumns = columns.filter((col) => {
    const isSystemColumn = SYSTEM_COLUMN_IDS.includes(col.id as any);
    if (isSystemColumn) return false;

    const metaClassName = col.columnDef.meta?.className;
    return !metaClassName || !isFixedSizeColumn(metaClassName);
  });

  const fixedWidth = fixedColumns.reduce((sum, col) => sum + col.getSize(), 0);
  const hasFixedColumns = fixedColumns.length > 0;

  return {
    fixedColumns,
    autoColumns,
    fixedWidth,
    hasFixedColumns,
    autoColumnsCount: autoColumns.length,
  };
}