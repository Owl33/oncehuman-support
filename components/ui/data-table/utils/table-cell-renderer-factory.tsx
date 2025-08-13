// components/ui/data-table/utils/table-cell-renderer-factory.tsx
"use client";
import React, { ReactNode } from "react";
import { flexRender } from "@tanstack/react-table";
import { CellRendererFactory, CellRendererContext, CellRendererType } from "./cell-renderer-factory";
import { SmartTooltipCell } from "../components/main/smart-tooltip-cell";

export interface TableCellRendererContext extends CellRendererContext {
  // Additional context for table cell rendering
}

// Helper function for rendering custom cell content
function renderCustomContent(column: any, row: any, value: any, table: any) {
  if (!column.columnDef.cell) {
    return value || <span className="text-muted-foreground">-</span>;
  }

  return flexRender(column.columnDef.cell, {
    row,
    column,
    table,
    getValue: () => value,
    renderValue: () => value,
    cell: { getValue: () => value },
  });
}

// Helper function to extract text content for tooltip
function extractTextContent(column: any, row: any, value: any, table: any): string {
  if (!column.columnDef.cell) {
    return String(value || '');
  }

  // 기본 값부터 시도
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  // row.original에서 해당 컬럼 데이터 추출
  const originalValue = row.original?.[column.id];
  if (typeof originalValue === 'string' || typeof originalValue === 'number') {
    return String(originalValue);
  }

  // 빈 문자열 반환 (복잡한 React 컴포넌트 렌더링 방지)
  return '';
}

// Table cell renderer variants
export const TableCellRenderers = {
  // System column renderer (for checkboxes, actions, etc.)
  system: ({ column, row, value, table }: any): ReactNode => {
    const content = renderCustomContent(column, row, value, table) || "-";
    const textContent = extractTextContent(column, row, value, table);
    
    return (
      <div className="w-full flex items-center justify-center">
        <SmartTooltipCell tooltipText={textContent}>
          {content}
        </SmartTooltipCell>
      </div>
    );
  },

  // Read-only cell renderer (for non-editable data)
  readonly: ({ column, row, value, table }: any): ReactNode => {
    const content = renderCustomContent(column, row, value, table);
    const textContent = extractTextContent(column, row, value, table);
    
    return (
      <div className="px-3 border border-transparent h-[36px] flex items-center w-full">
        <SmartTooltipCell tooltipText={textContent}>
          {content}
        </SmartTooltipCell>
      </div>
    );
  },

  // Editable cell renderer - delegates to CellRendererFactory
  editable: (context: CellRendererContext): ReactNode => {
    const rendererType = (context.meta?.editType || "text") as CellRendererType;
    return CellRendererFactory.render(rendererType, context);
  },
};

export type TableCellRendererType = keyof typeof TableCellRenderers;

export class TableCellRendererFactory {
  static render(type: TableCellRendererType, context: any): ReactNode {
    const renderer = TableCellRenderers[type];
    if (!renderer) {
      throw new Error(`Unknown table cell renderer type: ${type}`);
    }
    return renderer(context);
  }
}