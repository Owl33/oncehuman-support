// components/ui/data-table/components/data-table-body.tsx
"use client";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/base/table";
import { useDataTableContext } from "@/components/ui/data-table/contexts/data-table-context";
import { DataTableRowHeaderCell } from "./row-header-cell";
import { DataTableRowCell } from "./row-cell";
import { categorizeColumns } from "@/components/ui/data-table/utils/column-utils";
import { categorizeColumnsByPriority, shouldUseCollapseMode, getResponsiveColumnConfig } from "@/components/ui/data-table/utils/column-priority";
import { useMobileDetection } from "@/components/ui/data-table/hooks/use-mobile-detection";
import { CollapsibleTableRow } from "../responsive/collapsible-table-row";
import { cn } from "@/lib/utils";
import "@/components/ui/data-table/types/table-types"; // TanStack Table 타입 확장

export const DataTableMain = () => {
  const { table, editState, isRowEditing } = useDataTableContext();
  const { isMobile, isTablet, screenWidth } = useMobileDetection();
  
  // Manage expand state for collapsible rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Expand state management functions
  const toggleExpand = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };
  
  const isExpanded = (rowId: string) => expandedRows.has(rowId);

  if (!table) return null;

  const { tempRowId, editingData } = editState;
  const isAddMode = editState.editMode === "add";

  // Analyze columns for collapse mode
  const originalTableColumns = table.getAllColumns() || [];
  const { hasCollapsibleContent } = categorizeColumnsByPriority(originalTableColumns);
  const isCollapseMode = shouldUseCollapseMode(screenWidth, hasCollapsibleContent);
  
  // Use original columns for table operations
  const tableColumns = originalTableColumns;
  
  // Get responsive column configuration
  const { visibleColumns, hiddenColumns } = getResponsiveColumnConfig(tableColumns, isCollapseMode);

  // Get all rows including temp row for add mode
  const renderRows = () => {
    const baseRows = table.getRowModel().rows;

    if (isAddMode) {
      const tempRow = {
        id: tempRowId,
        original: editingData[tempRowId] || {},
        getIsSelected: () => false,
        getVisibleCells: () =>
          table
            .getAllColumns()
            .filter((column) => column.getIsVisible())
            .map((column) => ({
              id: column.id,
              column,
              getValue: () => editingData[tempRowId]?.[column.id] || "",
            })),
      };

      return [tempRow, ...baseRows];
    }

    return baseRows;
  };

  const allRows = renderRows();

  // 테이블 레이아웃 계산 - 기존 로직과 새로운 collapse 모드 통합
  const tableLayout = categorizeColumns(tableColumns);

  // 디버그 로그 (필요시에만 활성화)
  /* if (process.env.NODE_ENV === "development") {
   console.log("Table Layout Debug:", {
      fixedWidth: tableLayout.fixedWidth,
      autoColumnsCount: tableLayout.autoColumnsCount,
      columnsCount: tableColumns.length,
      fixedColumns: tableLayout.fixedColumns.map((col) => ({ id: col.id, size: col.getSize() })),
      autoColumns: tableLayout.autoColumns.map((col) => ({ id: col.id })),
      isCollapseMode,
      hasCollapsibleContent,
    });
  }*/

  return (
    <Table
      className={cn(
        "w-full rounded-md border bg-background",
        isCollapseMode ? "overflow-x-hidden" : "overflow-auto"
      )}
      style={{
        tableLayout: isCollapseMode ? "auto" : "fixed",
        width: "100%",
      }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers
                .filter((header) => {
                  // In collapse mode, only show headers for visible columns (excluding expand which we'll add manually)
                  if (!isCollapseMode) return true;
                  return visibleColumns.some(col => col.id === header.column.id) && header.column.id !== 'expand';
                })
                .map((header) => (
                  <DataTableRowHeaderCell
                    key={header.id}
                    header={header}
                  />
                ))}
              {/* Add expand header manually for collapse mode */}
              {isCollapseMode && hasCollapsibleContent && (
                <th key="expand-header" className="w-[60px] p-2">
                  <div className="flex items-center justify-center">
                    <span className="sr-only">확장</span>
                  </div>
                </th>
              )}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {allRows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isCollapseMode ? visibleColumns.length : tableColumns.length}
                className="h-24 text-center text-muted-foreground">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            allRows.map((row) => (
              <CollapsibleTableRow
                key={row.id}
                row={row}
                table={table}
                isCollapseMode={isCollapseMode}
                isExpanded={isExpanded(row.id)}
                onToggleExpand={toggleExpand}
              />
            ))
          )}
        </TableBody>
      </Table>
  );
};
