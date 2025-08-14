// components/ui/data-table/table-layout/renderers/CellRenderer.tsx
"use client";
import React, { ReactNode } from "react";
import { flexRender } from "@tanstack/react-table";
import { Input } from "@/components/base/input";
import { Textarea } from "@/components/base/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { Badge } from "@/components/base/badge";
import { CELL_RENDERER_TYPES } from "../../shared/constants";
import type { CellRendererContext, CellRendererType } from "../../shared/types";
import { extractTextContent } from "../../shared/helpers";

/**
 * 통합된 셀 렌더러 시스템
 */
export class CellRenderer {
  /**
   * 편집 모드 셀 렌더링
   */
  static renderEditable(context: CellRendererContext): ReactNode {
    const { currentValue, placeholder, autoFocus, onChange, meta } = context;
    const rendererType = (meta?.editType || CELL_RENDERER_TYPES.TEXT) as CellRendererType;

    switch (rendererType) {
      case CELL_RENDERER_TYPES.TEXT:
        return (
          <Input
            value={currentValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="h-9 touch-manipulation"
          />
        );

      case CELL_RENDERER_TYPES.NUMBER:
        return (
          <Input
            type="number"
            value={currentValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="h-9 touch-manipulation"
          />
        );

      case CELL_RENDERER_TYPES.TEXTAREA:
        return (
          <Textarea
            value={currentValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="min-h-[80px] touch-manipulation"
          />
        );

      case CELL_RENDERER_TYPES.SELECT:
        if (!meta?.editOptions?.length) {
          return (
            <Badge
              variant="destructive"
              className="text-xs">
              No options
            </Badge>
          );
        }

        const selected = meta.editOptions.find((opt: any) => opt.value === currentValue);

        return (
          <Select
            value={currentValue || ""}
            onValueChange={onChange}>
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

      default:
        return (
          <Input
            value={currentValue || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="h-9 touch-manipulation"
          />
        );
    }
  }

  /**
   * 읽기 전용 셀 렌더링
   */
  static renderReadonly(context: CellRendererContext): ReactNode {
    const { value, column, row, table } = context;

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

    // Input과 동일한 스타일로 렌더링 (h-9, px-3, py-1)
    return (
      <div className="h-9 px-3 py-1 flex items-center text-base">
        {value || <span className="text-muted-foreground">-</span>}
      </div>
    );
  }

  /**
   * 시스템 컬럼 렌더링 (체크박스, 액션 등)
   */
  static renderSystem(context: CellRendererContext): ReactNode {
    // SystemColumns에서 이미 적절한 컨테이너를 제공하므로 그대로 반환
    return this.renderReadonly(context);
  }

  /**
   * 메인 렌더링 함수 - 자동으로 적절한 렌더러 선택
   */
  static render(type: "editable" | "readonly" | "system", context: CellRendererContext): ReactNode {
    switch (type) {
      case "editable":
        return this.renderEditable(context);
      case "system":
        return this.renderSystem(context);
      case "readonly":
      default:
        return this.renderReadonly(context);
    }
  }
}

/**
 * 툴팁을 위한 텍스트 추출 유틸리티
 */
export function extractCellText(column: any, row: any, value: any): string {
  if (!column.columnDef.cell) {
    return extractTextContent(value);
  }

  // row.original에서 해당 컬럼 데이터 추출
  const originalValue = row.original?.[column.id];
  return extractTextContent(originalValue);
}
