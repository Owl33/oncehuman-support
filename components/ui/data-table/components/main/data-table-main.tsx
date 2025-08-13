// components/ui/data-table/components/data-table-body.tsx
"use client";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/base/table";
import { useDataTableContext } from "@/components/ui/data-table/contexts/data-table-context";
import { DataTableRowHeaderCell } from "./row-header-cell";
import { DataTableRowCell } from "./row-cell";
import { categorizeColumns } from "@/components/ui/data-table/utils/column-utils";
import { cn } from "@/lib/utils";
import "@/components/ui/data-table/types/table-types"; // TanStack Table 타입 확장
import "@/components/ui/data-table/styles/table-fixed-width.css";

export const DataTableMain = () => {
  const { table, editState, isRowEditing } = useDataTableContext();

  if (!table) return null;

  const { tempRowId, editingData } = editState;
  const isAddMode = editState.editMode === "add";

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

  // 테이블 레이아웃 계산 - 유틸리티 함수 사용
  const allColumns = table?.getAllColumns() || [];
  const tableLayout = categorizeColumns(allColumns);

  // 디버그 로그 (필요시에만 활성화)
  /* if (process.env.NODE_ENV === "development") {
   console.log("Table Layout Debug:", {
      fixedWidth: tableLayout.fixedWidth,
      autoColumnsCount: tableLayout.autoColumnsCount,
      columnsCount: allColumns.length,
      fixedColumns: tableLayout.fixedColumns.map((col) => ({ id: col.id, size: col.getSize() })),
      autoColumns: tableLayout.autoColumns.map((col) => ({ id: col.id })),
    });
  }*/

  return (
    <div className="overflow-auto rounded-md border bg-background">
      <Table
        className="w-full"
        style={{
          tableLayout: "fixed",
          width: "100%", // 컨테이너를 완전히 채우도록
        }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <DataTableRowHeaderCell
                  key={header.id}
                  header={header}
                />
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {allRows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="h-24 text-center text-muted-foreground">
                검색 결과가 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            allRows.map((row) => {
              const isNewRow = row.id === tempRowId;
              const isEditing = isRowEditing(row.id);

              const cells =
                row.getVisibleCells?.() ||
                table
                  .getAllColumns()
                  .filter((column) => column.getIsVisible())
                  .map((column) => ({
                    id: column.id,
                    column,
                    getValue: () => (isNewRow ? editingData[tempRowId]?.[column.id] || "" : ""),
                  }));

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected?.() ? "selected" : undefined}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    isEditing && "bg-muted/30",
                    isNewRow && "bg-[var(--selection)]/30 hover:bg-[var(--selection)]/40"
                  )}>
                  {cells.map((cell) => (
                    <DataTableRowCell
                      key={cell.id}
                      cell={cell}
                      row={row}
                      table={table}
                    />
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
