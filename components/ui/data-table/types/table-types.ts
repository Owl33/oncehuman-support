// components/ui/data-table/types/table-types.ts
import "@tanstack/react-table";
import { DataTableRef } from "../index";

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    tableRef?: React.RefObject<DataTableRef<TData> | null>;
    isInEditMode?: boolean;
  }
  
  interface ColumnMeta<TData, TValue> {
    displayName?: string;
    editable?: boolean;
    editType?: "text" | "select" | "textarea" | "number";
    editOptions?: { label: string; value: any }[];
  }
}