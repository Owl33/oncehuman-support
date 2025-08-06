// components/ui/data-table/data-table.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "./hooks/use-data-table";
import { DataTableProvider } from "./context/data-table-context";
import { DataTableContent } from "./components/data-table-content";
import { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { createSelectionColumn } from "./utils/selection-column";
import { useDataTableContext } from "./context/data-table-context";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean;
  showSelection?: boolean;
  tableId?: string;
  customHeaderContent?: React.ReactNode;
  className?: string;
  onSave?: (data: { updatedRows: TData[]; newRow: TData | null }) => void;
  onDelete?: (data: TData[]) => void;
}

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
  isInEditMode: boolean;
  isAddMode: boolean;
}

// Internal component that uses context
function DataTableInner<TData, TValue>(
  props: DataTableProps<TData, TValue> & { tableRef: React.MutableRefObject<DataTableRef<TData> | null> }
) {
  const context = useDataTableContext<TData>();
  const { table, startAdd, cancelEdit, saveChanges, completeSave, isInEditMode, isAddMode, clearAllFilters } = context;

  useImperativeHandle(
    props.tableRef,
    () => ({
      getSelectedRows: () => {
        const selectedRows = table?.getSelectedRowModel().rows || [];
        return selectedRows.map((row) => row.original);
      },
      clearSelection: () => {
        table?.setRowSelection({});
      },
      getTableData: () => props.data,
      getFilteredData: () => {
        const filteredRows = table?.getFilteredRowModel().rows || [];
        return filteredRows.map((row) => row.original);
      },
      clearFilters: () => {
        clearAllFilters();
      },
      exportData: () => {
        const filteredRows = table?.getFilteredRowModel().rows || [];
        return filteredRows.map((row) => row.original);
      },
      startAdd,
      cancelAll: cancelEdit,
      saveChanges,
      completeSave,
      isInEditMode,
      isAddMode,
    }),
    [table, props.data, startAdd, cancelEdit, saveChanges, completeSave, isInEditMode, isAddMode, clearAllFilters]
  );

  return <DataTableContent {...props} />;
}

// Main component
function DataTableComponent<TData, TValue>(
  props: DataTableProps<TData, TValue>,
  ref: React.Ref<DataTableRef<TData>>
) {
  const {
    columns,
    data,
    showSelection = true,
    tableId: propTableId,
    onSave,
    onDelete,
  } = props;

  const tableRef = useRef<DataTableRef<TData>>(null);

  // Generate table ID
  const tableId = useMemo(() => {
    if (propTableId) return propTableId;

    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const urlKey = pathname.slice(1).replace(/\//g, "-") || "home";
      return `table-${urlKey}`;
    }

    return "table-ssr";
  }, [propTableId]);

  // Add selection column if needed
  const finalColumns = useMemo(() => {
    if (!showSelection) return columns;

    const hasSelectColumn = columns.some((col) => "id" in col && col.id === "select");
    if (hasSelectColumn) return columns;

    return [createSelectionColumn<TData>(), ...columns];
  }, [columns, showSelection]);

  // Create table instance
  const { table, savedState } = useDataTable({
    columns: finalColumns,
    data,
    tableId,
  });

  useImperativeHandle(ref, () => tableRef.current!, []);

  console.log('Loading savedState:', savedState);

  return (
    <DataTableProvider
      table={table}
      tableId={tableId}
      initialFilterState={savedState.filterState}
      onSave={onSave}
      onDelete={onDelete}
    >
      <DataTableInner {...props} columns={finalColumns} tableRef={tableRef} />
    </DataTableProvider>
  );
}

export const DataTable = forwardRef(DataTableComponent) as <TData, TValue>(
  props: DataTableProps<TData, TValue> & { ref?: React.Ref<DataTableRef<TData>> }
) => React.ReactElement;