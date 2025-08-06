// components/ui/data-table/utils/selection-column.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/base/checkbox";

export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    size: 32,
    header: ({ table }) => {
      // Get context from table meta or create inline component
      const HeaderCheckbox = () => {
        // This will be wrapped by provider, so context will be available
        const isInEditMode = table.options.meta?.isInEditMode || false;
        
        return (
          <div className="text-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              disabled={isInEditMode}
              aria-label="Select all"
            />
          </div>
        );
      };
      
      return <HeaderCheckbox />;
    },
    cell: ({ row, table }) => {
      // Row selection checkbox
      const RowCheckbox = () => {
        const isInEditMode = table.options.meta?.isInEditMode || false;
        
        if (row.id === "temp_new_row") {
          return (
            <div className="text-center">
              <Checkbox checked={false} disabled aria-label="Select row" />
            </div>
          );
        }

        return (
          <div className="text-center">
            <Checkbox
              checked={row?.getIsSelected() || false}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              disabled={isInEditMode}
              aria-label="Select row"
            />
          </div>
        );
      };
      
      return <RowCheckbox />;
    },
    enableSorting: false,
    enableHiding: false,
  };
}