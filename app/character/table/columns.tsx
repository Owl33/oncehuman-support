//app/character/table/column.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BaseCharacter } from "../../../types/character";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
const scenarioSelectList = [
  { label: "터치 오브 스카이", value: "manibus" },
  { label: "무한한 꿈", value: "endless-dream" },
  { label: "혹독한 설산", value: "way-of-winter" },
  { label: "프리즘 전쟁", value: "prismverse's-clash" },
  { label: "진화의 부름", value: "evolution's-call" },
];
const jobSelectList = [
  { label: "메타 휴먼", value: "meta-human" },
  { label: "정원사", value: "crafter" },
  { label: "셰프", value: "chef" },
  { label: "조련사", value: "tamer" },
];

const getScenarioLabel = (selectList: any[], value: string) => {
  const lists = selectList.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});
  return lists[value] || value;
};

export const columns: ColumnDef<BaseCharacter>[] = [
  {
    accessorKey: "scenario",
    header: "시나리오",
    enableResizing: false,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return getScenarioLabel(scenarioSelectList, value);
    },
    meta: {
      displayName: "시나리오",
      editable: true,
      editType: "select",
      editOptions: scenarioSelectList,
      mobileVisibility: "visible",
      className: " ", // 모바일에서 최소 너비 보장
    },
  },
  {
    accessorKey: "server",
    header: "서버",
    enableResizing: false,
    meta: {
      displayName: "서버",
      editable: true,
      editType: "text",
      className: "min-w-[150px]", // 모바일에서 최소 너비 보장
    },
  },
  {
    accessorKey: "name",
    header: "캐릭터명",
    enableResizing: false,
    meta: {
      mobileVisibility: "visible",
      editable: true,
      displayName: "캐릭터명",
      className: "", // 가장 중요한 필드로 더 넓게
    },
  },
  {
    accessorKey: "job",
    header: "직업",
    enableResizing: false,
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return getScenarioLabel(jobSelectList, value);
    },
    meta: {
      displayName: "직업",
      editable: true,
      editType: "select",
      editOptions: jobSelectList,
      className: " ", // 모바일에서 최소 너비 보장
    },
  },
  {
    accessorKey: "desc",
    header: "비고",
    enableResizing: false,
    meta: {
      displayName: "비고",
      editable: true,
      editType: "text",
      className: "", // 텍스트 입력을 위한 충분한 공간
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
