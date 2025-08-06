//app/character/table/column.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/base/checkbox";
import { Input } from "@/components/base/input";
import { useState } from "react";
import { Button } from "@/components/base/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Payment } from "../page";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import "@tanstack/react-table";
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    displayName?: string;
    editable?: boolean;
    editType?: "text" | "select" | "textarea";
    editOptions?: { label: string; value: any }[];
    startEditing?: () => any;
    onSave?: (rowId: string, columnId: string, value: any) => Promise<void>;
  }
  interface TableMeta<TData> {
    isInEditMode?: boolean;
  }
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "scenario",
    header: "시나리오",

    meta: {
      displayName: "시나리오",
      editable: true,
      editType: "text",
    },
  },
  {
    accessorKey: "server",

    header: "서버",
    meta: {
      displayName: "서버",
      editable: true,
      editType: "text",
    },
  },

  {
    accessorKey: "job",
    header: ({ column }) => {
      return <p>직업</p>;
    },
    meta: {
      displayName: "직업",
      editable: true,
      editType: "text",
    },
  },
  {
    accessorKey: "desc",
    header: "비고",
    meta: {
      displayName: "비고",
      editable: true,
      editType: "text",
    },
  },
  {
    accessorKey: "name",
    header: "캐릭터명",
    meta: {
      editable: true,
      displayName: "캐릭터명",
    },
  },

  /* {
    id: "actions",
    size: 0,
    meta: {
      editable: false,
    },
    cell: ({ row }) => {
      const payment = row.original;
      const items: DropdownItem[] = [
        {
          type: "label",
          value: "Actions",
        },
        {
          type: "separator",
        },
        {
          type: "item",
          value: "Copy payment ID",
          onClick: () => navigator.clipboard.writeText(payment.id),
        },
        {
          type: "separator",
        },
        {
          type: "item",
          value: "View customer",
        },
        {
          type: "item",
          value: "View payment details",
        },
      ];

      return (
        <Dropdown
          trigger={
            <Button
              variant="ghost"
              className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
          items={items}></Dropdown>
      );
    },
  },*/
];
