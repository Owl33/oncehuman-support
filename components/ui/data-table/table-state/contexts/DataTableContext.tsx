// components/ui/data-table/table-state/contexts/DataTableContext.tsx
"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Table as ReactTable } from "@tanstack/react-table";
import { useEditingState } from "../../table-features/editing";
import { useFilteringState } from "../../table-features/filtering";
import { createDebouncedSave } from "../../shared/storage";
import type { DataTableRef, FilterState } from "../../shared/types";

interface DataTableContextValue<TData> {
  // Table instance
  table: ReactTable<TData> | null;

  // Edit state and actions
  editState: ReturnType<typeof useEditingState>['editState'];
  isInEditMode: boolean;
  isAddMode: boolean;
  startEdit: () => void;
  startEditRow: (rowId: string) => void;
  startAdd: () => void;
  updateCell: (rowId: string, columnId: string, value: any) => void;
  saveChanges: () => { updatedRows: TData[]; newRow: TData | null };
  completeSave: () => void;
  cancelEdit: () => void;
  isRowEditing: (rowId: string) => boolean;
  getEditingRowIds: () => string[];
  getSelectedRowIds: () => string[];

  // Filter state and actions
  filterState: FilterState;
  updateIndividualFilter: (column: string, value: string) => void;
  clearIndividualFilter: (column: string) => void;
  updateGlobalFilter: (value: string) => void;
  clearGlobalFilter: () => void;
  clearAllFilters: () => void;
  toggleFilterColumn: (columnId: string, checked: boolean) => void;
  setFilterMode: (mode: "global" | "individual") => void;
  getColumnDisplayName: (columnId: string) => string;

  // Save callbacks
  onSave?: (data: { updatedRows: TData[]; newRow: TData | null }) => void;
  onDelete?: (data: TData[]) => void;
}

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

export const useDataTableContext = <TData,>() => {
  const context = useContext(DataTableContext) as DataTableContextValue<TData> | null;
  if (!context) {
    throw new Error("useDataTableContext must be used within DataTableProvider");
  }
  return context;
};

interface DataTableProviderProps<TData> {
  children: ReactNode;
  table: ReactTable<TData>;
  tableId: string;
  initialFilterState?: Partial<FilterState>;
  onSave?: (data: { updatedRows: TData[]; newRow: TData | null }) => void;
  onDelete?: (data: TData[]) => void;
}

export const DataTableProvider = <TData,>({
  children,
  table,
  tableId,
  initialFilterState,
  onSave,
  onDelete,
}: DataTableProviderProps<TData>) => {
  
  // 편집 상태 관리
  const editingManager = useEditingState(table);
  
  // 필터 상태 관리
  const filteringManager = useFilteringState(initialFilterState);

  // 필터 상태 저장
  const debouncedSaveFilter = useMemo(
    () => createDebouncedSave(tableId, 300, { merge: true }),
    [tableId]
  );

  // 필터 상태 변경 시 자동 저장
  useEffect(() => {
    debouncedSaveFilter({ filterState: filteringManager.filterState });
  }, [debouncedSaveFilter, filteringManager.filterState]);

  // 테이블에 글로벌 필터 동기화
  useEffect(() => {
    const globalFilterValue = filteringManager.filterState.values.global || "";
    if (table.getState().globalFilter !== globalFilterValue) {
      table.setGlobalFilter(globalFilterValue);
    }
  }, [table, filteringManager.filterState.values.global]);

  // 컬럼 필터들을 테이블에 동기화
  useEffect(() => {
    const columnFilters = Object.entries(filteringManager.filterState.values)
      .filter(([key]) => key !== "global")
      .map(([columnId, value]) => ({ id: columnId, value }));
    
    table.setColumnFilters(columnFilters);
  }, [table, filteringManager.filterState.values]);

  // 컬럼 표시명 가져오기
  const getColumnDisplayName = useCallback((columnId: string) => {
    const column = table.getAllColumns().find((col) => col.id === columnId);
    return column?.columnDef.meta?.displayName || columnId;
  }, [table]);

  // 모든 필터 삭제 (테이블과 동기화)
  const clearAllFilters = useCallback(() => {
    // 상태 클리어
    filteringManager.clearAllFilters();
    
    // 테이블 필터 클리어
    table.getAllColumns().forEach((col) => {
      col.setFilterValue("");
    });
    table.setGlobalFilter("");
  }, [table, filteringManager]);

  const value = useMemo<DataTableContextValue<TData>>(
    () => ({
      table,
      
      // 편집 관련
      editState: editingManager.editState,
      isInEditMode: editingManager.isInEditMode,
      isAddMode: editingManager.isAddMode,
      startEdit: editingManager.startEdit,
      startEditRow: editingManager.startEditRow,
      startAdd: editingManager.startAdd,
      updateCell: editingManager.updateCell,
      saveChanges: editingManager.saveChanges,
      completeSave: editingManager.completeSave,
      cancelEdit: editingManager.cancelEdit,
      isRowEditing: editingManager.isRowEditing,
      getEditingRowIds: editingManager.getEditingRowIds,
      getSelectedRowIds: editingManager.getSelectedRowIds,
      
      // 필터 관련
      filterState: filteringManager.filterState,
      updateIndividualFilter: filteringManager.updateIndividualFilter,
      clearIndividualFilter: filteringManager.clearIndividualFilter,
      updateGlobalFilter: filteringManager.updateGlobalFilter,
      clearGlobalFilter: filteringManager.clearGlobalFilter,
      clearAllFilters,
      toggleFilterColumn: filteringManager.toggleFilterColumn,
      setFilterMode: filteringManager.setFilterMode,
      getColumnDisplayName,
      
      // 콜백
      onSave,
      onDelete,
    }),
    [
      table,
      editingManager,
      filteringManager,
      getColumnDisplayName,
      clearAllFilters,
      onSave,
      onDelete,
    ]
  );

  return <DataTableContext.Provider value={value}>{children}</DataTableContext.Provider>;
};