// components/ui/data-table/hooks/use-data-table.tsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { sessionStorageUtils } from "@/utils/session-storage";
import { DEFAULT_FILTER_COLUMNS } from "../constants";
import { useDebouncedSave } from "./use-debounced-save";

interface UseDataTableProps<TData, TValue> {
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
    mode: 'global' | 'individual';
    values: Record<string, string>;
  };
}

export function useDataTable<TData, TValue>({
  columns,
  data,
  tableId,
}: UseDataTableProps<TData, TValue>) {
  // Load saved state with proper typing
  const savedState = useMemo(
    (): Partial<SavedTableState> => sessionStorageUtils.getJSON<SavedTableState>(tableId) || {},
    [tableId]
  );

  // Merge saved state with initial state from props
  const initialState = savedState;
  // Initialize states
  const [sorting, setSorting] = useState<SortingState>(
    initialState.sorting || []
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialState.columnFilters || []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialState.columnVisibility || {}
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [globalFilter, setGlobalFilter] = useState(
    initialState.filterState?.values?.global || ""
  );

  // Create global filter function
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

  // Create table instance
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

  // Save table state (sorting, filters, visibility) to sessionStorage
  // filterState는 Context에서 저장하므로 여기서는 제외
  const tableStateToSave = useMemo(() => ({
    sorting,
    columnFilters,
    columnVisibility,
  }), [sorting, columnFilters, columnVisibility]);

  useDebouncedSave(tableId, tableStateToSave, { delay: 300, merge: true });

  return {
    table,
    savedState: savedState as SavedTableState,
  };
}