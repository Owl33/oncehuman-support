// components/ui/data-table/contexts/data-table-context.tsx
"use client";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  ReactNode,
  useRef,
} from "react";
import { Table as ReactTable } from "@tanstack/react-table";
import { useDebouncedSave } from "../hooks/use-debounced-save";

// Types
type EditMode = "none" | "edit" | "add";

interface EditState {
  editMode: EditMode;
  editingData: Record<string, any>;
  originalData: Record<string, any>;
  tempRowId: string;
}

interface FilterState {
  activeColumns: string[]; // 필터링할 컬럼들
  mode: "global" | "individual"; // 필터 모드
  values: Record<string, string>; // 필터 값들 (globalFilter는 'global' 키로 저장)
}

interface DataTableContextValue<TData> {
  // Table instance
  table: ReactTable<TData> | null;

  // Edit state and actions
  editState: EditState;
  isInEditMode: boolean;
  isAddMode: boolean;
  startEdit: () => void;
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

// Create context with proper typing
const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

// Custom hook for using the context
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
  const tempRowId = "temp_new_row";

  // Edit state
  const [editState, setEditState] = useState<EditState>({
    editMode: "none",
    editingData: {},
    originalData: {},
    tempRowId,
  });

  // Filter state - 초기값 제대로 설정
  const [filterState, setFilterState] = useState<FilterState>(() => {
    // sessionStorage에서 로드된 값이 있으면 사용
    if (initialFilterState && Object.keys(initialFilterState).length > 0) {
      return {
        activeColumns: initialFilterState.activeColumns || ["name"],
        mode: initialFilterState.mode || "global",
        values: initialFilterState.values || {},
      };
    }
    // 없으면 기본값
    return {
      activeColumns: ["name"],
      mode: "global",
      values: {},
    };
  });

  // Computed values
  const isInEditMode = editState.editMode !== "none";
  const isAddMode = editState.editMode === "add";

  // Edit actions
  const getSelectedRowIds = useCallback(() => {
    return Object.keys(table.getState().rowSelection);
  }, [table]);

  const startEdit = useCallback(() => {
    const selectedIds = getSelectedRowIds();
    if (selectedIds.length === 0) return;

    const newEditingData: Record<string, any> = {};
    const newOriginalData: Record<string, any> = {};

    selectedIds.forEach((rowId) => {
      const row = table.getRowModel().rows.find((r) => r.id === rowId);
      if (row) {
        newEditingData[rowId] = { ...row.original };
        newOriginalData[rowId] = { ...row.original };
      }
    });

    setEditState({
      editMode: "edit",
      editingData: newEditingData,
      originalData: newOriginalData,
      tempRowId,
    });
  }, [table, getSelectedRowIds, tempRowId]);

  const startAdd = useCallback(() => {
    if (isInEditMode) return;

    const initialData: any = {};
    table.getAllColumns().forEach((column) => {
      if (column.columnDef.meta?.editable) {
        initialData[column.id] = "";
      }
    });

    setEditState({
      editMode: "add",
      editingData: { [tempRowId]: initialData },
      originalData: { [tempRowId]: {} },
      tempRowId,
    });

    table.setRowSelection({});
  }, [table, isInEditMode, tempRowId]);

  const updateCell = useCallback((rowId: string, columnId: string, value: any) => {
    setEditState((prev) => ({
      ...prev,
      editingData: {
        ...prev.editingData,
        [rowId]: {
          ...prev.editingData[rowId],
          [columnId]: value,
        },
      },
    }));
  }, []);

  const saveChanges = useCallback(() => {
    let updatedRows: TData[] = [];
    let newRow: TData | null = null;

    if (editState.editMode === "add") {
      newRow = editState.editingData[tempRowId] as TData;
    } else if (editState.editMode === "edit") {
      const selectedIds = Object.keys(editState.editingData);
      updatedRows = selectedIds
        .map((rowId) => {
          const edited = editState.editingData[rowId];
          const original = editState.originalData[rowId];

          const hasChanges = Object.keys(edited).some((key) => edited[key] !== original[key]);

          return hasChanges ? (edited as TData) : null;
        })
        .filter(Boolean) as TData[];
    }

    return { updatedRows, newRow };
  }, [editState, tempRowId]);

  const completeSave = useCallback(() => {
    setEditState({
      editMode: "none",
      editingData: {},
      originalData: {},
      tempRowId,
    });
    table.setRowSelection({});
  }, [table, tempRowId]);

  const cancelEdit = useCallback(() => {
    completeSave();
  }, [completeSave]);

  const isRowEditing = useCallback(
    (rowId: string) => {
      return editState.editingData.hasOwnProperty(rowId);
    },
    [editState.editingData]
  );

  const getEditingRowIds = useCallback(() => {
    return Object.keys(editState.editingData);
  }, [editState.editingData]);

  // Filter actions - 통합된 업데이트 함수
  const updateFilterValue = useCallback((key: string, value: string) => {
    setFilterState((prev) => ({
      ...prev,
      values: { ...prev.values, [key]: value },
    }));
  }, []);

  const clearFilterValue = useCallback((key: string) => {
    setFilterState((prev) => {
      const newValues = { ...prev.values };
      delete newValues[key];
      return { ...prev, values: newValues };
    });
  }, []);

  const updateIndividualFilter = useCallback(
    (column: string, value: string) => {
      updateFilterValue(column, value);
    },
    [updateFilterValue]
  );

  const clearIndividualFilter = useCallback(
    (column: string) => {
      clearFilterValue(column);
    },
    [clearFilterValue]
  );

  const updateGlobalFilter = useCallback(
    (value: string) => {
      updateFilterValue("global", value);
    },
    [updateFilterValue]
  );

  const clearGlobalFilter = useCallback(() => {
    clearFilterValue("global");
  }, [clearFilterValue]);

  const clearAllFilters = useCallback(() => {
    setFilterState((prev) => ({ ...prev, values: {} }));
    // Clear all column filters in table
    table.getAllColumns().forEach((col) => {
      col.setFilterValue("");
    });
    table.setGlobalFilter("");
  }, [table]);

  const toggleFilterColumn = useCallback((columnId: string, checked: boolean) => {
    setFilterState((prev) => ({
      ...prev,
      activeColumns: checked
        ? prev.activeColumns.includes(columnId)
          ? prev.activeColumns
          : [...prev.activeColumns, columnId]
        : prev.activeColumns.filter((id) => id !== columnId),
    }));
  }, []);

  const setFilterMode = useCallback((mode: "global" | "individual") => {
    setFilterState((prev) => ({ ...prev, mode }));
  }, []);

  const getColumnDisplayName = useCallback(
    (columnId: string) => {
      const column = table.getAllColumns().find((col) => col.id === columnId);
      return column?.columnDef.meta?.displayName || columnId;
    },
    [table]
  );

  // Save filter state to sessionStorage
  useDebouncedSave(tableId, { filterState }, { delay: 300, merge: true });

  // Context value
  const value = useMemo<DataTableContextValue<TData>>(
    () => ({
      table,
      editState,
      isInEditMode,
      isAddMode,
      startEdit,
      startAdd,
      updateCell,
      saveChanges,
      completeSave,
      cancelEdit,
      isRowEditing,
      getEditingRowIds,
      getSelectedRowIds,
      filterState,
      updateIndividualFilter,
      clearIndividualFilter,
      updateGlobalFilter,
      clearGlobalFilter,
      clearAllFilters,
      toggleFilterColumn,
      setFilterMode,
      getColumnDisplayName,
      onSave,
      onDelete,
    }),
    [
      table,
      editState,
      isInEditMode,
      isAddMode,
      startEdit,
      startAdd,
      updateCell,
      saveChanges,
      completeSave,
      cancelEdit,
      isRowEditing,
      getEditingRowIds,
      getSelectedRowIds,
      filterState,
      updateIndividualFilter,
      clearIndividualFilter,
      updateGlobalFilter,
      clearGlobalFilter,
      clearAllFilters,
      toggleFilterColumn,
      setFilterMode,
      getColumnDisplayName,
      onSave,
      onDelete,
    ]
  );

  return <DataTableContext.Provider value={value}>{children}</DataTableContext.Provider>;
};
