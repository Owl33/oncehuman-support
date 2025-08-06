// components/ui/data-table/components/data-table-header.tsx
"use client";
import { useDataTableContext } from "../context/data-table-context";
import { DataTableFilter } from "./data-table-filter";

interface DataTableHeaderProps {
  customHeaderContent?: React.ReactNode;
}

export const DataTableHeader = ({ customHeaderContent }: DataTableHeaderProps) => {
  return (
    <div className="flex items-center justify-between py-4">
      <DataTableFilter />
      {customHeaderContent}
    </div>
  );
};
