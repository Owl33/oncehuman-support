//components/ui/dropdown/dropdown.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/base/dropdown-menu";
import { ReactNode } from "react";
import React from "react";

type DropdownItemMap = {
  label: React.ComponentProps<typeof DropdownMenuLabel> & {
    value: any;
  };
  separator: React.ComponentProps<typeof DropdownMenuSeparator>;
  item: React.ComponentProps<typeof DropdownMenuItem> & {
    value: any;
  };
  checkbox: React.ComponentProps<typeof DropdownMenuCheckboxItem> & {
    value: any;
  };
};

export type DropdownItem = {
  [K in keyof DropdownItemMap]: { type: K } & DropdownItemMap[K];
}[keyof DropdownItemMap];

type DropdownProps = {
  trigger?: ReactNode;
  items?: DropdownItem[];
  children?: ReactNode; // contents 대신 children만 사용
};

const RendererItem = (item: DropdownItem, idx: number) => {
  const element = {
    label: (item: any, key: string) => (
      <DropdownMenuLabel
        key={key}
        className={item.className}>
        {item.value}
      </DropdownMenuLabel>
    ),
    separator: (item: any, key: string) => (
      <DropdownMenuSeparator
        key={key}
        className={item.className}
      />
    ),
    item: (item: any, key: string) => (
      <DropdownMenuItem
        key={key}
        className={item.className}
        onClick={item.onClick}
        disabled={item.disabled}>
        {item.value}
      </DropdownMenuItem>
    ),
    checkbox: (item: any, key: string) => (
      <DropdownMenuCheckboxItem
        key={key}
        checked={item.checked}
        onCheckedChange={item.onCheckedChange}
        className={item.className}
        disabled={item.disabled}>
        {item.value}
      </DropdownMenuCheckboxItem>
    ),
  };

  const key = `${item.type}${idx}`;

  return element[item.type](item, key);
};

export const Dropdown = ({ trigger, items, children }: DropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        {children}
        {items?.map((item, idx) => RendererItem(item, idx))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
