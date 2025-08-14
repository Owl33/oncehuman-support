// components/ui/data-table/shared/types.ts
import "@tanstack/react-table";
import { ReactNode } from "react";
import type { CellRendererType } from "./constants";

// Re-export for convenience
export type { ColumnPriority, CellRendererType } from "./constants";

// TanStack Table 확장
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    tableRef?: React.RefObject<DataTableRef<TData> | null>;
    isInEditMode?: boolean;
  }
  
  interface ColumnMeta<TData, TValue> {
    displayName?: string;
    editable?: boolean;
    editType?: CellRendererType;
    editOptions?: { label: string; value: any }[];
    className?: string;
    
    // 반응형 width 시스템
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    
    // 반응형 우선순위
    priority?: import("./constants").ColumnPriority;
  }
}

// DataTable 인터페이스
export interface DataTableRef<TData> {
  getSelectedRows: () => TData[];
  clearSelection: () => void;
  getTableData: () => TData[];
  getFilteredData: () => TData[];
  clearFilters: () => void;
  exportData: () => TData[];
  startAdd: () => void;
  cancelAll: () => void;
  saveChanges: () => { updatedRows: TData[]; newRow: TData | null };
  completeSave: () => void;
  updateData: (updater: (data: TData[]) => TData[]) => void;
  getRowData: (rowId: string) => TData | undefined;
  isInEditMode: boolean;
  isAddMode: boolean;
}

// Action 아이템 타입
export interface ActionItem<TData> {
  label: string;
  icon?: ReactNode;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  disabled?: (row: TData) => boolean;
}

// Edit 상태 타입
export type EditMode = "none" | "edit" | "add";

export interface EditState {
  editMode: EditMode;
  editingData: Record<string, any>;
  originalData: Record<string, any>;
  tempRowId: string;
}

// Filter 상태 타입
export interface FilterState {
  activeColumns: string[];
  mode: "global" | "individual";
  values: Record<string, string>;
}

// Cell Renderer Context
export interface CellRendererContext {
  value: any;
  currentValue: any;
  placeholder: string;
  autoFocus?: boolean;
  onChange: (value: any) => void;
  meta?: any;
  column?: any;
  row?: any;
  table?: any;
}

// 모바일 감지 Hook 타입
export interface MobileDetectionHook {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

// Column 분석 결과
export interface ColumnAnalysis {
  totalColumns: number;
  editableColumns: number;
  systemColumns: number;
  fixedWidth: number;
  autoColumnsCount: number;
  hasResponsiveColumns: boolean;
}