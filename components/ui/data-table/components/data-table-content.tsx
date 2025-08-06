// components/ui/data-table/components/data-table-content.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableHeader } from "./data-table-header";
import { DataTableBody } from "./data-table-body";
import { DataTablePagination } from "./data-table-pagination";
import { FloatingActionBar } from "./floating-action-bar";
import { useDataTableContext } from "../contexts/data-table-context";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

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
    <div className={cn("space-y-4", className)}>
      <DataTableHeader customHeaderContent={customHeaderContent} />
      
      <div className="relative">
        <DataTableBody />
        <FloatingActionBar />
      </div>
      
      {showPagination && (
        <div className="border-t pt-4">
          <DataTablePagination />
        </div>
      )}
    </div>
  );
}