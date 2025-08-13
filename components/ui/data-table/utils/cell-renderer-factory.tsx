// components/ui/data-table/utils/cell-renderer-factory.tsx
"use client";
import React, { ReactNode } from "react";
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
import { flexRender } from "@tanstack/react-table";

export type CellRendererType = "text" | "textarea" | "select" | "number" | "readonly";

export interface CellRendererContext {
  value: any;
  currentValue: any;
  placeholder: string;
  autoFocus?: boolean;
  onChange: (value: any) => void;
  meta?: any;
  // For readonly mode
  column?: any;
  row?: any;
  table?: any;
}

export interface CellRenderer {
  render(context: CellRendererContext): ReactNode;
}

// Text input renderer
class TextCellRenderer implements CellRenderer {
  render({ currentValue, placeholder, autoFocus, onChange }: CellRendererContext): ReactNode {
    return (
      <Input
        value={currentValue || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    );
  }
}

// Number input renderer
class NumberCellRenderer implements CellRenderer {
  render({ currentValue, placeholder, autoFocus, onChange }: CellRendererContext): ReactNode {
    return (
      <Input
        type="number"
        value={currentValue || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    );
  }
}

// Textarea renderer
class TextareaCellRenderer implements CellRenderer {
  render({ currentValue, placeholder, autoFocus, onChange }: CellRendererContext): ReactNode {
    return (
      <Textarea
        value={currentValue || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-h-[80px]"
      />
    );
  }
}

// Select renderer
class SelectCellRenderer implements CellRenderer {
  render({ currentValue, placeholder, onChange, meta }: CellRendererContext): ReactNode {
    if (!meta?.editOptions?.length) {
      return <Badge variant="destructive" className="text-xs">No options</Badge>;
    }

    const selected = meta.editOptions.find((opt: any) => opt.value === currentValue);
    
    return (
      <Select value={currentValue || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={`${placeholder} 선택`}>
            {selected?.label && <span>{selected.label}</span>}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {meta.editOptions.map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
}

// Readonly renderer
class ReadonlyCellRenderer implements CellRenderer {
  render({ value, column, row, table }: CellRendererContext): ReactNode {
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
    return value || <span className="text-muted-foreground">-</span>;
  }
}

// Factory class
export class CellRendererFactory {
  private static renderers: Map<CellRendererType, CellRenderer> = new Map([
    ["text", new TextCellRenderer()],
    ["number", new NumberCellRenderer()],
    ["textarea", new TextareaCellRenderer()],
    ["select", new SelectCellRenderer()],
    ["readonly", new ReadonlyCellRenderer()],
  ]);

  static getRenderer(type: CellRendererType): CellRenderer {
    const renderer = this.renderers.get(type);
    if (!renderer) {
      throw new Error(`Unknown cell renderer type: ${type}`);
    }
    return renderer;
  }

  static render(type: CellRendererType, context: CellRendererContext): ReactNode {
    const renderer = this.getRenderer(type);
    return renderer.render(context);
  }
}