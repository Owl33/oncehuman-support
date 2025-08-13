// components/ui/data-table/data-table.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { useDataTable } from "./hooks/use-data-table";
import { DataTableProvider } from "./contexts/data-table-context";
import { DataTableContent } from "./components/data-table-content";
import { forwardRef, useMemo, useRef, useImperativeHandle, useEffect } from "react";
import { createSelectionColumn } from "./utils/selection-column";
import { createActionsColumn, ActionItem } from "./utils/actions-column";
import { useDataTableContext } from "./contexts/data-table-context";
import "./types/table-types"; // 타입 확장 import

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean;
  showSelection?: boolean;
  showActions?: boolean;

  actionItems?: ActionItem<TData>[] | ((row: TData) => ActionItem<TData>[]);
  customActions?: {
    header?: string | React.ReactNode;
    size?: number;
    render: (row: TData, tableRef: React.RefObject<DataTableRef<TData> | null>) => React.ReactNode;
  };
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
  updateData: (updater: (data: TData[]) => TData[]) => void;
  getRowData: (rowId: string) => TData | undefined;
  isInEditMode: boolean;
  isAddMode: boolean;
}

// Internal component that uses context
function DataTableInner<TData, TValue>(
  props: DataTableProps<TData, TValue> & {
    tableRef: React.RefObject<DataTableRef<TData> | null>;
    finalColumns: ColumnDef<TData, TValue>[];
  }
) {
  const context = useDataTableContext<TData>();
  const {
    table,
    startAdd,
    cancelEdit,
    saveChanges,
    completeSave,
    isInEditMode,
    isAddMode,
    clearAllFilters,
  } = context;

  // Update table meta with current edit mode state
  useEffect(() => {
    if (table) {
      table.options.meta = {
        ...table.options.meta,
        isInEditMode,
      };
    }
  }, [table, isInEditMode]);

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
      updateData: (updater: (data: TData[]) => TData[]) => {
        // This would require lifting state up or using a state management solution
        console.warn("updateData is not yet implemented. Consider using onSave callback instead.");
      },
      getRowData: (rowId: string) => {
        const row = table?.getRowModel().rows.find((r) => r.id === rowId);
        return row?.original;
      },
      isInEditMode,
      isAddMode,
    }),
    [
      table,
      props.data,
      startAdd,
      cancelEdit,
      saveChanges,
      completeSave,
      isInEditMode,
      isAddMode,
      clearAllFilters,
    ]
  );

  return (
    <DataTableContent
      {...props}
      columns={props.finalColumns}
    />
  );
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
    showActions = false,
    actionItems,
    customActions,

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

  // Add selection and actions columns if needed
  const finalColumns = useMemo(() => {
    let cols = [...columns];

    // Add selection column at the beginning
    if (showSelection) {
      const hasSelectColumn = cols.some((col) => "id" in col && col.id === "select");
      if (!hasSelectColumn) {
        cols = [createSelectionColumn<TData>(), ...cols];
      }
    }

    // Add actions column at the end
    if (showActions || customActions) {
      const hasActionsColumn = cols.some(
        (col) => "id" in col && (col.id === "actions" || col.id === "custom-actions")
      );
      if (!hasActionsColumn) {
        if (customActions) {
          // 내부에서 직접 컬럼 생성
          const customActionsColumn: ColumnDef<TData> = {
            id: "custom-actions",
            size: customActions.size || 100,
            enableSorting: false,
            enableHiding: false,
            meta: {
              editable: false,
            },
            header: () => <div className="text-center">{customActions.header || "Actions"}</div>,
            cell: ({ row, table }) => {
              const tableRef = (table.options.meta as any)?.tableRef;
              return (
                <div className="text-center">{customActions.render(row.original, tableRef)}</div>
              );
            },
          };
          cols = [...cols, customActionsColumn];
        } else if (actionItems) {
          cols = [...cols, createActionsColumn<TData>({ items: actionItems })];
        }
      }
    }

    return cols;
  }, [columns, showSelection, showActions, actionItems, customActions]);

  // Create table instance
  const { table, savedState } = useDataTable({
    columns: finalColumns,
    data,
    tableId,
  });

  // Add tableRef to table meta for access in columns
  if (table) {
    table.options.meta = {
      ...table.options.meta,
      tableRef,
      isInEditMode: false, // Context에서 관리하지만 초기값 설정
    };
  }

  // Forward ref
  useImperativeHandle(ref, () => tableRef.current!, []);

  return (
    <DataTableProvider
      table={table}
      tableId={tableId}
      initialFilterState={savedState.filterState}
      onSave={onSave}
      onDelete={onDelete}>
      <DataTableInner
        {...props}
        finalColumns={finalColumns}
        tableRef={tableRef}
      />
    </DataTableProvider>
  );
}

export const DataTable = forwardRef(DataTableComponent) as <TData, TValue>(
  props: DataTableProps<TData, TValue> & { ref?: React.Ref<DataTableRef<TData>> }
) => React.ReactElement;
