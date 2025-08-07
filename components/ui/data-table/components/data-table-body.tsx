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

  return (
    <div className="overflow-auto rounded-md border bg-background">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSystemColumn = SYSTEM_COLUMN_IDS.includes(header.column.id as any);

                return (
                  <TableHead
                    key={header.id}
                    style={{ width: `${header.getSize()}px` }}>
                    {header.isPlaceholder ? null : (
                      <>
                        {isSystemColumn ? (
                          flexRender(header.column.columnDef.header, header.getContext())
                        ) : (
                          <div
                            style={{ width: `${header.getSize()}px` }}
                            className={cn(EDITABLE_CELL_HEIGHT, "flex items-center px-3 py-1")}>
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
                  {cells.map((cell) => (
                    <TableCell key={cell.id}
                    >
                      <EditableCell
                        row={row}
                        column={cell.column}
                        value={cell.getValue()}
                        table={table}
                      />
                    </TableCell>
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
