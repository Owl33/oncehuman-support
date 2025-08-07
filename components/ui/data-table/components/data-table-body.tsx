// components/ui/data-table/components/data-table-body.tsx
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/base/table";
import { flexRender } from "@tanstack/react-table";
import { useDataTableContext } from "../contexts/data-table-context";
import { EditableCell } from "./editable-cell";
import { cn } from "@/lib/utils";
import { SYSTEM_COLUMN_IDS, EDITABLE_CELL_HEIGHT } from "../constants";
import { parseColumnSize, isFixedSizeColumn, ColumnSizeValue } from "../utils/column-size-parser";
import "../types/table-types"; // TanStack Table 타입 확장
import "../types/css-types.d"; // CSS 변수 타입 확장
import "../table-fixed-width.css";

export const DataTableBody = () => {
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

  // Calculate table width strategy
  const calculateTableLayout = () => {
    if (!table) return { totalWidth: 0, hasFixedColumns: false, fixedColumns: [], autoColumns: [] };

    const allColumns = table.getAllColumns();

    // 새로운 유연한 컬럼 구분 로직 - meta.className 기반
    const fixedColumns = allColumns.filter((col) => {
      // System columns (select, actions)는 항상 고정
      const isSystemColumn = SYSTEM_COLUMN_IDS.includes(col.id as any);
      if (isSystemColumn) return true;

      // meta.className이 설정되어 있고, 고정 크기 타입인지 확인
      const metaClassName = col.columnDef.meta?.className;
      return metaClassName && isFixedSizeColumn(metaClassName);
    });

    const autoColumns = allColumns.filter((col) => {
      const isSystemColumn = SYSTEM_COLUMN_IDS.includes(col.id as any);
      if (isSystemColumn) return false;

      const metaClassName = col.columnDef.meta?.className;
      return !metaClassName || !isFixedSizeColumn(metaClassName);
    });

    const fixedWidth = fixedColumns.reduce((sum, col) => sum + col.getSize(), 0);
    const hasFixedColumns = fixedColumns.length > 0;

    console.log("Table Layout Debug:", {
      fixedWidth,
      autoColumnsCount: autoColumns.length,
      columnsCount: allColumns.length,
      fixedColumns: fixedColumns.map((col) => ({ id: col.id, size: col.getSize() })),
      autoColumns: autoColumns.map((col) => ({ id: col.id })),
    });

    return {
      fixedWidth,
      hasFixedColumns,
      fixedColumns,
      autoColumns,
      autoColumnsCount: autoColumns.length,
    };
  };

  const tableLayout = calculateTableLayout();

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
              {headerGroup.headers.map((header) => {
                // 컬럼 크기 타입 분석 - meta.className 기반
                const isSystemColumn = SYSTEM_COLUMN_IDS.includes(header.column.id as any);
                const metaClassName = header.column.columnDef.meta?.className;
                const isFixedColumn = isSystemColumn || (metaClassName && isFixedSizeColumn(metaClassName));

                // 크기 값 파싱
                const parsedSize = metaClassName ? parseColumnSize(metaClassName) : null;

                // 스타일 객체 생성
                const headerStyle: React.CSSProperties = {};

                if (isFixedColumn && parsedSize) {
                  if (parsedSize.type === "tailwind" && !parsedSize.isFixed) {
                    // Tailwind 유틸리티 클래스는 className에 추가
                  } else {
                    // 고정 크기는 CSS 변수로 설정
                    headerStyle["--column-width"] = parsedSize.cssValue;
                  }
                }

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "p-0 h-[44px] box-border",
                      isFixedColumn ? "table-fixed-column" : "table-auto-column",
                      // Tailwind width 클래스 추가 (고정되지 않은 경우)
                      parsedSize?.type === "tailwind" && !parsedSize.isFixed
                        ? (parsedSize.value as string)
                        : ""
                    )}
                    style={headerStyle}>
                    {header.isPlaceholder ? null : (
                      <>
                        {isSystemColumn ? (
                          flexRender(header.column.columnDef.header, header.getContext())
                        ) : (
                          <div
                            className={cn(
                              EDITABLE_CELL_HEIGHT,
                              "flex items-center px-3 overflow-hidden"
                            )}>
                            <span className="text-sm  font-medium">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </TableHead>
                );
              })}
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
                    isNewRow && "bg-green-50 dark:bg-green-950/20"
                  )}>
                  {cells.map((cell) => {
                    // 컬럼 크기 타입 분석 - meta.className 기반
                    const isSystemColumn = SYSTEM_COLUMN_IDS.includes(cell.column.id as any);
                    const metaClassName = cell.column.columnDef.meta?.className;
                    const isFixedColumn = isSystemColumn || (metaClassName && isFixedSizeColumn(metaClassName));

                    // 크기 값 파싱
                    const parsedSize = metaClassName ? parseColumnSize(metaClassName) : null;

                    // 스타일 객체 생성
                    const cellStyle: React.CSSProperties = {};

                    if (isFixedColumn && parsedSize) {
                      if (parsedSize.type === "tailwind" && !parsedSize.isFixed) {
                        // Tailwind 유틸리티 클래스는 className에 추가
                      } else {
                        // 고정 크기는 CSS 변수로 설정
                        cellStyle["--column-width"] = parsedSize.cssValue;
                      }
                    }

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "p-0 overflow-hidden h-[44px] box-border",
                          isFixedColumn ? "table-fixed-column" : "table-auto-column",
                          // Tailwind width 클래스 추가 (고정되지 않은 경우)
                          parsedSize?.type === "tailwind" && !parsedSize.isFixed
                            ? (parsedSize.value as string)
                            : ""
                        )}
                        style={cellStyle}>
                        <EditableCell
                          row={row}
                          column={cell.column}
                          value={cell.getValue()}
                          table={table}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
