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
    className?: string; // 기타 CSS 클래스 지원 (width 용도 아님)
    
    // 새로운 간단한 width 시스템
    width?: string; // 예: "200px", "20%", "auto"
    minWidth?: string; // 예: "100px", "10%"
    maxWidth?: string; // 예: "400px", "40%"
  }
}

