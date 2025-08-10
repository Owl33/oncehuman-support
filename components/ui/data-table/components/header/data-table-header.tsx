// components/ui/data-table/components/data-table-header.tsx
"use client";
import { useDataTableContext } from "@/components/ui/data-table/contexts/data-table-context";
import { DataTableFilter } from "@/components/ui/data-table/components/header/data-table-filter";
import { cn } from "@/lib/utils";

interface DataTableHeaderProps {
  customHeaderContent?: React.ReactNode;
  className?: string;
}

export function DataTableHeader({ 
  customHeaderContent,
  className 
}: DataTableHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4",
      className
    )}>
      <DataTableFilter />
      {customHeaderContent && (
        <div className="flex items-center gap-2">
          {customHeaderContent}
        </div>
      )}
    </div>
  );
}