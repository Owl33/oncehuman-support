// components/ui/data-table/core/DataTableMain.tsx
"use client";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/base/table";
import { flexRender } from "@tanstack/react-table";
import { useDataTableContext } from "../table-state";
import { useMobileDetection } from "../table-features/responsive";
import { ColumnManager } from "../table-columns";
import { ResponsiveTableRow } from "../table-layout/components";
import { cn } from "@/lib/utils";

export const DataTableMain = () => {
  const { table, editState, isRowEditing } = useDataTableContext();
  const { screenWidth } = useMobileDetection();

  // Manage expand state for collapsible rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Expand state management functions
  const toggleExpand = (rowId: string) => {
    setExpandedRows((prev) => {
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
  const allColumns = table.getAllColumns() || [];
  const { hasCollapsibleContent } = ColumnManager.categorizeByMobileBehavior(allColumns);
  const isCollapseMode = ColumnManager.shouldUseCollapseMode(screenWidth, hasCollapsibleContent);

  // Get responsive column configuration
  const { visibleColumns } = ColumnManager.getResponsiveConfig(allColumns, isCollapseMode);

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

  // Render table header
  const renderTableHeader = () => (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers
            .filter((header) => {
              // In collapse mode, only show headers for visible columns (excluding expand which we'll add manually)
              if (!isCollapseMode) return true;
              return (
                visibleColumns.some((col) => col.id === header.column.id) &&
                header.column.id !== "expand"
              );
            })
            .map((header) => {
              const meta = header.column.columnDef.meta;
              return (
                <th
                  key={header.id}
                  className={cn(
                    "h-12 px-3  align-middle font-medium text-muted-foreground",
                    meta?.className
                  )}
                  style={{
                    width: meta?.width,
                    minWidth: meta?.minWidth,
                    maxWidth: meta?.maxWidth,
                  }}>
                  {header.isPlaceholder ? null : (
                    <div
                      className={cn(
                        meta?.priority == "system" ? "justify-center" : "justify-start",
                        "flex items-center space-x-2"
                      )}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  )}
                </th>
              );
            })}
          {/* Add expand header manually for collapse mode */}
          {isCollapseMode && hasCollapsibleContent && (
            <th
              key="expand-header"
              className="w-[60px] px-3 py-2">
              <div className="flex items-center justify-center">
                <span className="sr-only">확장</span>
              </div>
            </th>
          )}
        </TableRow>
      ))}
    </TableHeader>
  );

  // Render table body
  const renderTableBody = () => (
    <TableBody>
      {allRows.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={isCollapseMode ? visibleColumns.length : allColumns.length}
            className="h-24 text-center text-muted-foreground">
            검색 결과가 없습니다.
          </TableCell>
        </TableRow>
      ) : (
        allRows.map((row) => (
          <ResponsiveTableRow
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
  );

  return (
    <Table
      className={cn(
        "w-full rounded-md border bg-background table-fixed",
        isCollapseMode ? "overflow-x-hidden" : "overflow-auto"
      )}
      style={{
        tableLayout: "fixed",
        width: "100%",
        maxWidth: "100vw",
      }}>
      {renderTableHeader()}
      {renderTableBody()}
    </Table>
  );
};
