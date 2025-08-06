// components/ui/data-table/components/data-table-content.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableHeader } from "./data-table-header";
import { DataTableBody } from "./data-table-body";
import { DataTablePagination } from "./data-table-pagination";
import { FloatingActionBar } from "./floating-action-bar";
import { useDataTableContext } from "../context/data-table-context";
import { useEffect } from "react";

interface DataTableContentProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean;
  customHeaderContent?: React.ReactNode;
  className?: string;
}

export function DataTableContent<TData, TValue>({
  showPagination = true,
  customHeaderContent,
  className,
}: DataTableContentProps<TData, TValue>) {
  const { cancelEdit } = useDataTableContext<TData>();

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelEdit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cancelEdit]);

  return (
    <div className={className}>
      <DataTableHeader customHeaderContent={customHeaderContent} />
      <FloatingActionBar />
      <DataTableBody />
      {showPagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <DataTablePagination />
        </div>
      )}
    </div>
  );
}