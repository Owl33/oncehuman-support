// components/ui/data-table/utils/actions-column.tsx
"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/base/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { MoreVertical } from "lucide-react";

export interface ActionItem<TData> {
  type: "item" | "label" | "separator";
  value?: string | React.ReactNode;
  onClick?: (row: TData) => void;
  disabled?: boolean | ((row: TData) => boolean);
  destructive?: boolean;
}

interface CreateActionsColumnOptions<TData> {
  items: ActionItem<TData>[] | ((row: TData) => ActionItem<TData>[]);
  trigger?: React.ReactNode;
}

export const createActionsColumn = <TData,>({
  items,
  trigger,
}: CreateActionsColumnOptions<TData>): ColumnDef<TData> => {
  return {
    id: "actions",
    size: 50,
    enableSorting: false,
    enableHiding: false,
    meta: {
      editable: false,
    },
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const data = row.original;
      const actionItems = typeof items === "function" ? items(data) : items;

      // Convert to dropdown items
      const dropdownItems: DropdownItem[] = actionItems.map((item) => {
        if (item.type === "separator") {
          return { type: "separator" };
        }

        if (item.type === "label") {
          return {
            type: "label",
            value: item.value as string,
          };
        }

        const isDisabled = typeof item.disabled === "function" 
          ? item.disabled(data) 
          : item.disabled;

        return {
          type: "item",
          value: item.value,
          onClick: () => item.onClick?.(data),
          disabled: isDisabled,
          className: item.destructive ? "text-destructive" : undefined,
        };
      });

      return (
        <div className="text-center">
          <Dropdown
            trigger={
              trigger || (
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              )
            }
            items={dropdownItems}
          />
        </div>
      );
    },
  };
}