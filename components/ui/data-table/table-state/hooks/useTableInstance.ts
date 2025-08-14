// components/ui/data-table/table-state/hooks/useTableInstance.ts
"use client";
import { useState, useCallback, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableStorage, createDebouncedSave } from "../../shared/storage";
import { DEFAULT_FILTER_COLUMNS } from "../../shared/constants";

interface UseTableInstanceProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableId: string;
}

interface TableOnlyState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  columnVisibility: VisibilityState;
}

interface SavedTableState extends TableOnlyState {
  filterState: {
    activeColumns: string[];
    mode: "global" | "individual";
    values: Record<string, string>;
  };
}

/**
 * 테이블 인스턴스 관리 Hook
 */
export function useTableInstance<TData, TValue>({
  columns,
  data,
  tableId,
}: UseTableInstanceProps<TData, TValue>) {
  
  // 저장된 상태 로드
  const savedState = useMemo(
    (): Partial<SavedTableState> => TableStorage.load<SavedTableState>(tableId) || {},
    [tableId]
  );

  // 테이블 상태들
  const [sorting, setSorting] = useState<SortingState>(savedState.sorting || []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    savedState.columnFilters || []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    savedState.columnVisibility || {}
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [globalFilter, setGlobalFilter] = useState(savedState.filterState?.values?.global || "");

  // 글로벌 필터 함수
  const globalFilterFn = useCallback(
    (row: any, columnId: string, filterValue: string) => {
      if (!filterValue) return true;

      const searchTerm = String(filterValue).toLowerCase();
      const filterColumns = savedState.filterState?.activeColumns || DEFAULT_FILTER_COLUMNS;

      return filterColumns.some((colId) => {
        const cellValue = row.getValue(colId);
        return cellValue != null && String(cellValue).toLowerCase().includes(searchTerm);
      });
    },
    [savedState.filterState?.activeColumns]
  );

  // 테이블 인스턴스 생성
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    autoResetAll: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // 상태 저장 함수
  const debouncedSave = useMemo(
    () => createDebouncedSave<TableOnlyState>(tableId, 300, { merge: true }),
    [tableId]
  );

  // 상태 변경 시 자동 저장
  const tableStateToSave = useMemo(
    () => ({
      sorting,
      columnFilters,
      columnVisibility,
    }),
    [sorting, columnFilters, columnVisibility]
  );

  // 디바운스된 저장 실행
  useMemo(() => {
    debouncedSave(tableStateToSave);
  }, [debouncedSave, tableStateToSave]);

  return {
    table,
    savedState: savedState as SavedTableState,
    
    // 상태 접근자들
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    globalFilter,
    
    // 상태 설정자들
    setSorting,
    setColumnFilters,
    setColumnVisibility,
    setRowSelection,
    setGlobalFilter,
  };
}