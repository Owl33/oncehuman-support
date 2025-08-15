// components/ui/data-table/core/DataTableContent.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useDataTableContext } from "../table-state";
import { DataTableHeader } from "./DataTableHeader";
import { DataTableMain } from "./DataTableMain";
import { DataTablePagination } from "./DataTablePagination";
import { FloatingActionBar } from "./FloatingActionBar";
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
    <div className={cn("w-full max-w-full overflow-hidden", className)}>
      <DataTableHeader customHeaderContent={customHeaderContent} />

      {/* FloatingActionBar positioned above table */}
      <div className="relative overflow-x-auto max-w-full">
        <FloatingActionBar />
        <div className="w-full max-w-full overflow-hidden">
          <DataTableMain />
        </div>
      </div>

      {showPagination && (
        <div className="border-t pt-4">
          <DataTablePagination />
        </div>
      )}
    </div>
  );
}