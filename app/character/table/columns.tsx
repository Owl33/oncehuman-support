//app/character/table/column.tsx

"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/base/checkbox";
import { Input } from "@/components/base/input";
import { useState } from "react";
import { Button } from "@/components/base/button";
import { CharacterData } from "@/types/character";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<CharacterData>[] = [
  {
    accessorKey: "scenario",
    header: "시나리오",

    meta: {
      displayName: "시나리오",
      editable: true,
      editType: "select",
      editOptions: [
        {
          label: "터치 오브 스카이",
          value: "touch",
        },
        {
          label: "무한한 꿈",
          value: "tab",
        },
        {
          label: "혹독한 설산",
          value: "toㄴuch",
        },
        {
          label: "레이드 존",
          value: "toucㄹh",
        },
        {
          label: "진화의 부름",
          value: "touㅇch",
        },
      ],
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
    accessorKey: "name",
    header: "캐릭터명",
    meta: {
      editable: true,
      displayName: "캐릭터명",
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
      editType: "select",
      editOptions: [
        {
          label: "메타 휴먼",
          value: "human",
        },
        {
          label: "조련사",
          value: "tab",
        },
        {
          label: "쉐프",
          value: "toㄴuch",
        },
        {
          label: "정원사",
          value: "toucㄹh",
        },
      ],
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
