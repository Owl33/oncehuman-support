// components/ui/data-table/utils/selection-column.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/base/checkbox";

export const createSelectionColumn = <TData,>(): ColumnDef<TData> => {
  return {
    id: "select",
    meta: {
      className: "w-[42px]",
    },
    header: ({ table }) => {
      // Get context from table meta or create inline component
      const HeaderCheckbox = () => {
        // This will be wrapped by provider, so context will be available
        const isInEditMode = table.options.meta?.isInEditMode || false;

        return (
          <div className="flex h-[44px] items-center justify-center ">
            <p>
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                disabled={isInEditMode}
                aria-label="Select all"
              />
            </p>
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
            <div className="flex items-center justify-center ">
              <div>
                <Checkbox
                  checked={false}
                  disabled
                  aria-label="Select row"
                />
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center ">
            <div>
              <Checkbox
                checked={row?.getIsSelected() || false}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                disabled={isInEditMode}
                aria-label="Select row"
              />
            </div>
          </div>
        );
      };

      return <RowCheckbox />;
    },
    enableSorting: false,
    enableHiding: false,
  };
};
