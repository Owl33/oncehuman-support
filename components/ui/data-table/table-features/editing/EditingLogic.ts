// components/ui/data-table/table-features/editing/EditingLogic.ts
"use client";
import { useState, useCallback } from "react";
import { TEMP_ROW_ID } from "../../shared/constants";
import type { EditState, EditMode } from "../../shared/types";
import { deepClone } from "../../shared/helpers";

/**
 * 편집 상태 관리 Hook
 */
export function useEditingState(table: any) {
  const [editState, setEditState] = useState<EditState>({
    editMode: "none",
    editingData: {},
    originalData: {},
    tempRowId: TEMP_ROW_ID,
  });

  // Computed values
  const isInEditMode = editState.editMode !== "none";
  const isAddMode = editState.editMode === "add";

  /**
   * 선택된 행들의 ID 가져오기
   */
  const getSelectedRowIds = useCallback(() => {
    const rowSelection = table?.getState().rowSelection || {};
    return Object.keys(rowSelection).filter(id => rowSelection[id] === true);
  }, [table]);

  /**
   * 일반 편집 모드 시작 (선택된 행들)
   */
  const startEdit = useCallback(() => {
    const selectedIds = getSelectedRowIds();
    if (selectedIds.length === 0) return;

    const newEditingData: Record<string, any> = {};
    const newOriginalData: Record<string, any> = {};

    selectedIds.forEach((rowId) => {
      const row = table?.getRowModel().rows.find((r: any) => r.id === rowId);
      if (row) {
        newEditingData[rowId] = deepClone(row.original);
        newOriginalData[rowId] = deepClone(row.original);
      }
    });

    setEditState({
      editMode: "edit",
      editingData: newEditingData,
      originalData: newOriginalData,
      tempRowId: TEMP_ROW_ID,
    });
  }, [table, getSelectedRowIds]);

  /**
   * 개별 행 편집 모드 시작
   */
  const startEditRow = useCallback((rowId: string) => {
    if (isInEditMode) return;

    const row = table?.getRowModel().rows.find((r: any) => r.id === rowId);
    if (!row) return;

    // 해당 행 선택
    table?.setRowSelection({ [rowId]: true });

    const newEditingData: Record<string, any> = {};
    const newOriginalData: Record<string, any> = {};
    
    newEditingData[rowId] = deepClone(row.original);
    newOriginalData[rowId] = deepClone(row.original);

    setEditState({
      editMode: "edit",
      editingData: newEditingData,
      originalData: newOriginalData,
      tempRowId: TEMP_ROW_ID,
    });
  }, [table, isInEditMode]);

  /**
   * 추가 모드 시작
   */
  const startAdd = useCallback(() => {
    if (isInEditMode) return;

    const initialData: any = {};
    table?.getAllColumns().forEach((column: any) => {
      if (column.columnDef.meta?.editable) {
        initialData[column.id] = "";
      }
    });

    setEditState({
      editMode: "add",
      editingData: { [TEMP_ROW_ID]: initialData },
      originalData: { [TEMP_ROW_ID]: {} },
      tempRowId: TEMP_ROW_ID,
    });

    table?.setRowSelection({});
  }, [table, isInEditMode]);

  /**
   * 셀 값 업데이트
   */
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

  /**
   * 변경사항 저장 준비
   */
  const saveChanges = useCallback(() => {
    let updatedRows: any[] = [];
    let newRow: any | null = null;

    if (editState.editMode === "add") {
      newRow = editState.editingData[TEMP_ROW_ID];
    } else if (editState.editMode === "edit") {
      const selectedIds = Object.keys(editState.editingData);
      updatedRows = selectedIds
        .map((rowId) => {
          const edited = editState.editingData[rowId];
          const original = editState.originalData[rowId];

          // 변경사항이 있는지 확인
          const hasChanges = Object.keys(edited).some((key) => edited[key] !== original[key]);
          return hasChanges ? edited : null;
        })
        .filter(Boolean);
    }

    return { updatedRows, newRow };
  }, [editState]);

  /**
   * 편집 완료 (상태 초기화)
   */
  const completeSave = useCallback(() => {
    setEditState({
      editMode: "none",
      editingData: {},
      originalData: {},
      tempRowId: TEMP_ROW_ID,
    });
    table?.setRowSelection({});
  }, [table]);

  /**
   * 편집 취소
   */
  const cancelEdit = useCallback(() => {
    completeSave();
  }, [completeSave]);

  /**
   * 행이 편집 중인지 확인
   */
  const isRowEditing = useCallback(
    (rowId: string) => {
      return editState.editingData.hasOwnProperty(rowId);
    },
    [editState.editingData]
  );

  /**
   * 편집 중인 행 ID들 가져오기
   */
  const getEditingRowIds = useCallback(() => {
    return Object.keys(editState.editingData);
  }, [editState.editingData]);

  return {
    // State
    editState,
    isInEditMode,
    isAddMode,

    // Actions
    startEdit,
    startEditRow,
    startAdd,
    updateCell,
    saveChanges,
    completeSave,
    cancelEdit,

    // Helpers
    isRowEditing,
    getEditingRowIds,
    getSelectedRowIds,
  };
}