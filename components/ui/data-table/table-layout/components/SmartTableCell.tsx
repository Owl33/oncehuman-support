// components/ui/data-table/table-layout/components/SmartTableCell.tsx
"use client";
import React from "react";
import { TableCell } from "@/components/base/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/base/tooltip";
import { useDataTableContext } from "../../table-state";
import { CellRenderer, extractCellText } from "../renderers/CellRenderer";
import { isSystemColumn } from "../../shared/helpers";
import { cn } from "@/lib/utils";

interface SmartTableCellProps {
  cell: any;
  row: any;
  table: any;
  layout?: 'default' | 'minimal';
}

/**
 * 향상된 스마트 테이블 셀
 * - 자동으로 편집/읽기 모드 감지
 * - 툴팁 지원
 * - 시스템 컬럼 특별 처리
 * - 터치 친화적 인터랙션
 */
export function SmartTableCell({ cell, row, table, layout = 'default' }: SmartTableCellProps) {
  const { isRowEditing, updateCell, editState } = useDataTableContext();
  
  const column = cell.column;
  const value = cell.getValue();
  const meta = column.columnDef.meta;
  const isSystemCol = isSystemColumn(column.id);
  const isEditing = isRowEditing(row.id);
  const canEdit = isEditing && meta?.editable && !isSystemCol;

  // 현재 편집 값 가져오기
  const currentValue = canEdit ? editState.editingData[row.id]?.[column.id] ?? value : value;

  // 렌더링 타입 결정
  const renderType = canEdit ? "editable" : isSystemCol ? "system" : "readonly";

  // 셀 컨텐츠 렌더링
  const cellContent = CellRenderer.render(renderType, {
    value,
    currentValue,
    placeholder: meta?.displayName || column.id,
    onChange: (newValue: any) => updateCell(row.id, column.id, newValue),
    meta,
    column,
    row,
    table,
  });

  // 툴팁 텍스트 추출
  const tooltipText = extractCellText(column, row, value);
  const shouldShowTooltip = tooltipText && tooltipText.length > 30;

  // 셀 스타일 계산
  const cellClassName = cn(
    "px-3 py-2 transition-colors duration-200",
    isSystemCol && "text-center",
    meta?.className
  );

  // 툴팁과 함께 셀 렌더링
  const cellWithTooltip = shouldShowTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="truncate w-full">{cellContent}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm whitespace-pre-wrap">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    cellContent
  );

  // minimal layout: TableCell wrapper 없이 컨텐츠만 반환 (확장 영역용)
  if (layout === 'minimal') {
    return cellWithTooltip;
  }

  // default layout: 전체 TableCell로 래핑
  return (
    <TableCell
      className={cellClassName}
      style={{
        width: meta?.width,
        minWidth: meta?.minWidth,
        maxWidth: meta?.maxWidth,
      }}
    >
      {cellWithTooltip}
    </TableCell>
  );
}