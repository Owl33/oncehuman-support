// components/ui/data-table/components/data-table-content.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableHeader } from "./header/data-table-header";
import { DataTableMain } from "./main/data-table-main";
import { DataTablePagination } from "./footer/data-table-pagination";
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
    <div className={cn("", className)}>
      <DataTableHeader customHeaderContent={customHeaderContent} />

      {/* FloatingActionBar positioned above table */}
      <div className="relative">
        <FloatingActionBar />
        <DataTableMain />
      </div>

      {showPagination && (
        <div className="border-t pt-4">
          <DataTablePagination />
        </div>
      )}
    </div>
  );
}
