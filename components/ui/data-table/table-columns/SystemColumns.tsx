// components/ui/data-table/table-columns/SystemColumns.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/base/checkbox";
import { Button } from "@/components/base/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/base/dropdown-menu";
import type { ActionItem } from "../shared/types";

/**
 * 선택 컬럼 생성
 */
export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    meta: {
      editable: false,
      priority: "system",
      className: "w-[36px]",
    },
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="모든 행 선택"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center  justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="행 선택"
        />
      </div>
    ),
  };
}

/**
 * 액션 컬럼 생성
 */
export function createActionsColumn<TData>(config: {
  items: ActionItem<TData>[] | ((row: TData) => ActionItem<TData>[]);
  size?: number;
  header?: string;
}): ColumnDef<TData> {
  const { items, size = 80, header = "Actions" } = config;

  return {
    id: "actions",
    size,
    enableSorting: false,
    enableHiding: false,
    meta: {
      editable: false,
      priority: "system",
    },
    header: () => <div className="text-center">{header}</div>,
    cell: ({ row }) => {
      const actionItems = typeof items === "function" ? items(row.original) : items;

      return (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="행 액션 메뉴">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actionItems.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => item.onClick(row.original)}
                  disabled={item.disabled?.(row.original)}
                  className={item.className}>
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  };
}

/**
 * 커스텀 액션 컬럼 생성
 */
export function createCustomActionsColumn<TData>(config: {
  header?: string | React.ReactNode;
  size?: number;
  render: (row: TData, tableRef: React.RefObject<any>) => React.ReactNode;
}): ColumnDef<TData> {
  const { header = "Actions", size = 100, render } = config;

  return {
    id: "custom-actions",
    size,
    enableSorting: false,
    enableHiding: false,
    meta: {
      editable: false,
      priority: "system",
    },
    header: () => <div className="text-center">{header}</div>,
    cell: ({ row, table }) => {
      const tableRef = (table.options.meta as any)?.tableRef;
      return <div className="text-center">{render(row.original, tableRef)}</div>;
    },
  };
}
