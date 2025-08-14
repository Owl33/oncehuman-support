// components/ui/data-table/table-features/filtering/FilterLogic.ts
"use client";
import { useState, useCallback } from "react";
import { DEFAULT_FILTER_COLUMNS } from "../../shared/constants";
import type { FilterState } from "../../shared/types";

/**
 * 필터링 상태 관리 Hook
 */
export function useFilteringState(initialFilterState?: Partial<FilterState>) {
  const [filterState, setFilterState] = useState<FilterState>(() => {
    if (initialFilterState && Object.keys(initialFilterState).length > 0) {
      return {
        activeColumns: initialFilterState.activeColumns || DEFAULT_FILTER_COLUMNS,
        mode: initialFilterState.mode || "global",
        values: initialFilterState.values || {},
      };
    }
    return {
      activeColumns: DEFAULT_FILTER_COLUMNS,
      mode: "global",
      values: {},
    };
  });

  /**
   * 필터 값 업데이트 (통합 함수)
   */
  const updateFilterValue = useCallback((key: string, value: string) => {
    setFilterState((prev) => ({
      ...prev,
      values: { ...prev.values, [key]: value },
    }));
  }, []);

  /**
   * 필터 값 삭제 (통합 함수)
   */
  const clearFilterValue = useCallback((key: string) => {
    setFilterState((prev) => {
      const newValues = { ...prev.values };
      delete newValues[key];
      return { ...prev, values: newValues };
    });
  }, []);

  /**
   * 개별 컬럼 필터 업데이트
   */
  const updateIndividualFilter = useCallback(
    (column: string, value: string) => {
      updateFilterValue(column, value);
    },
    [updateFilterValue]
  );

  /**
   * 개별 컬럼 필터 삭제
   */
  const clearIndividualFilter = useCallback(
    (column: string) => {
      clearFilterValue(column);
    },
    [clearFilterValue]
  );

  /**
   * 글로벌 필터 업데이트
   */
  const updateGlobalFilter = useCallback(
    (value: string) => {
      updateFilterValue("global", value);
    },
    [updateFilterValue]
  );

  /**
   * 글로벌 필터 삭제
   */
  const clearGlobalFilter = useCallback(() => {
    clearFilterValue("global");
  }, [clearFilterValue]);

  /**
   * 모든 필터 삭제
   */
  const clearAllFilters = useCallback(() => {
    setFilterState((prev) => ({ ...prev, values: {} }));
  }, []);

  /**
   * 필터 컬럼 토글
   */
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

  /**
   * 필터 모드 설정
   */
  const setFilterMode = useCallback((mode: "global" | "individual") => {
    setFilterState((prev) => ({ ...prev, mode }));
  }, []);

  /**
   * 글로벌 필터 함수 생성
   */
  const createGlobalFilterFn = useCallback(
    (activeColumns: string[] = filterState.activeColumns) => {
      return (row: any, columnId: string, filterValue: string) => {
        if (!filterValue) return true;

        const searchTerm = String(filterValue).toLowerCase();

        return activeColumns.some((colId) => {
          const cellValue = row.getValue(colId);
          return cellValue != null && String(cellValue).toLowerCase().includes(searchTerm);
        });
      };
    },
    [filterState.activeColumns]
  );

  return {
    // State
    filterState,

    // Individual column filters
    updateIndividualFilter,
    clearIndividualFilter,

    // Global filter
    updateGlobalFilter,
    clearGlobalFilter,

    // Filter management
    clearAllFilters,
    toggleFilterColumn,
    setFilterMode,

    // Utilities
    createGlobalFilterFn,
  };
}