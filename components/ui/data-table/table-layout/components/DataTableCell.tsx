// components/ui/data-table/table-layout/components/DataTableCell.tsx
"use client";
import React, { ReactNode } from "react";
import { flexRender } from "@tanstack/react-table";
import { Input } from "@/components/base/input";
import { Textarea } from "@/components/base/textarea";
import { Badge } from "@/components/base/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { TableCell } from "@/components/base/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/base/tooltip";
import { useDataTableContext } from "../../table-state";
import { useMobileDetection } from "../../table-features/responsive";
import { SYSTEM_COLUMN_IDS, CELL_RENDERER_TYPES } from "../../shared/constants";
import { extractTextContent } from "../../shared/helpers";
import { cn } from "@/lib/utils";
import type { CellRendererType } from "../../shared/types";

interface DataTableCellProps<TData> {
  cell: any;
  row: any;
  table: any;
  layout?: 'default' | 'minimal';
  forceReadonly?: boolean;
}

/**
 * 셀 렌더러들
 */
const cellRenderers = {
  // System column renderer
  system: ({ column, row, value, table }: any) => {
    if (column?.columnDef.cell) {
      return flexRender(column.columnDef.cell, {
        row,
        column,
        table,
        getValue: () => value,
        renderValue: () => value,
        cell: { getValue: () => value },
      });
    }
    return value || "-";
  },

  // Read-only cell renderer with Input-matching styles
  readonly: ({ column, row, value, table, isMobile }: any) => {
    let content: ReactNode;
    
    if (column?.columnDef.cell) {
      content = flexRender(column.columnDef.cell, {
        row,
        column,
        table,
        getValue: () => value,
        renderValue: () => value,
        cell: { getValue: () => value },
      });
    } else {
      content = value;
    }

    return (
      <div className="px-3 py-1 h-9 flex items-center text-base overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
        <span className="truncate overflow-hidden text-ellipsis whitespace-nowrap" style={{ width: '100%', maxWidth: '100%' }}>
          {content || <span className="text-muted-foreground">-</span>}
        </span>
      </div>
    );
  },

  // Text input renderer
  text: ({ value, placeholder, autoFocus, onChange }: any) => (
    <Input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="h-9 touch-manipulation"
    />
  ),

  // Number input renderer
  number: ({ value, placeholder, autoFocus, onChange }: any) => (
    <Input
      type="number"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="h-9 touch-manipulation"
    />
  ),

  // Textarea renderer
  textarea: ({ value, placeholder, autoFocus, onChange }: any) => (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="min-h-[80px] touch-manipulation"
    />
  ),

  // Select renderer
  select: ({ value, placeholder, onChange, meta }: any) => {
    if (!meta?.editOptions?.length) {
      return (
        <Badge variant="destructive" className="text-xs">
          No options
        </Badge>
      );
    }

    const selected = meta.editOptions.find((opt: any) => opt.value === value);

    return (
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="h-9 touch-manipulation">
          <SelectValue placeholder={`${placeholder} 선택`}>
            {selected?.label && <span>{selected.label}</span>}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {meta.editOptions.map((opt: any) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="h-9 touch-manipulation">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
};

/**
 * 통합 데이터 테이블 셀 컴포넌트
 */
export function DataTableCell<TData>({ cell, row, table, layout = 'default', forceReadonly = false }: DataTableCellProps<TData>) {
  const { isRowEditing, editState, updateCell } = useDataTableContext<TData>();
  const { isMobile } = useMobileDetection();

  const column = cell.column;
  const value = cell.getValue();
  const meta = column.columnDef.meta;
  const isSystemColumn = SYSTEM_COLUMN_IDS.includes(column.id as any);
  const isEditing = isRowEditing(row.id);
  const canEdit = !forceReadonly && isEditing && meta?.editable && !isSystemColumn;

  // 현재 편집 값 가져오기
  const currentValue = canEdit ? editState.editingData[row.id]?.[column.id] ?? value : value;

  // 첫 번째 편집 가능한 컬럼인지 확인 (autofocus용)
  const isFirstEditColumn = React.useMemo(() => {
    if (!canEdit) return false;
    const firstCol = table
      .getAllColumns()
      .find((col: any) => col.columnDef.meta?.editable && !SYSTEM_COLUMN_IDS.includes(col.id as any));
    return firstCol?.id === column.id;
  }, [canEdit, column.id, table]);

  // 변경 핸들러
  const handleChange = React.useCallback(
    (newValue: any) => {
      updateCell(row.id, column.id, newValue);
    },
    [updateCell, row.id, column.id]
  );

  // 렌더러 타입 결정
  const rendererType = React.useMemo(() => {
    if (isSystemColumn) return 'system';
    if (canEdit) {
      return (meta?.editType || CELL_RENDERER_TYPES.TEXT) as CellRendererType;
    }
    return 'readonly';
  }, [isSystemColumn, canEdit, meta?.editType]);

  // 렌더러 속성 준비
  const rendererProps = React.useMemo(() => {
    const baseProps = { column, row, value, table, isMobile };

    if (canEdit) {
      return {
        ...baseProps,
        value: currentValue,
        placeholder: meta?.displayName || column.id,
        autoFocus: isFirstEditColumn,
        onChange: handleChange,
        meta,
      };
    }

    return baseProps;
  }, [canEdit, column, row, value, table, isMobile, currentValue, meta, isFirstEditColumn, handleChange]);

  // 셀 콘텐츠 렌더링
  const renderer = cellRenderers[rendererType as keyof typeof cellRenderers] || cellRenderers.readonly;
  const content = renderer(rendererProps);

  // 툴팁 텍스트 추출
  const tooltipText = extractTextContent(value);
  const shouldShowTooltip = !canEdit && !isMobile && tooltipText && tooltipText.length > 30;

  // 툴팁 래핑
  const cellWithTooltip = shouldShowTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="truncate w-full">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm whitespace-pre-wrap">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    content
  );

  // 셀 스타일
  const cellClassName = cn(
    "px-3 py-2 transition-colors duration-200",
    isSystemColumn && "text-center",
    meta?.className
  );

  // layout이 minimal이면 TableCell wrapper 없이 컨텐츠만 반환
  if (layout === 'minimal') {
    return cellWithTooltip;
  }

  // 기본 layout: TableCell로 래핑
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