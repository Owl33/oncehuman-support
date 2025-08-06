// components/ui/data-table/utils/custom-actions-column.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableRef } from "../index";

interface CreateCustomActionsColumnOptions<TData> {
  render: (row: TData, tableRef: React.RefObject<DataTableRef<TData>>) => React.ReactNode;
  header?: string | React.ReactNode;
  size?: number;
}

export const createCustomActionsColumn = <TData,>({
  render,
  header = "Actions",
  size = 100,
}: CreateCustomActionsColumnOptions<TData>): ColumnDef<TData> => {
  return {
    id: "custom-actions",
    size,
    enableSorting: false,
    enableHiding: false,
    meta: {
      editable: false,
    },
    header: () => <div className="text-center">{header}</div>,
    cell: ({ row, table }) => {
      // table.options.meta에서 tableRef 접근
      const tableRef = (table.options.meta as any)?.tableRef;
      return <div className="text-center">{render(row.original, tableRef)}</div>;
    },
  };
};
