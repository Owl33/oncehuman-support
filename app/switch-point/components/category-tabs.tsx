// app/switchpoint/components/category-tabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/base/tabs";
import { ItemCategory, CATEGORY_LABELS } from "@/types/character";
import {
  Import,
  Pickaxe,
  Parentheses,
  Cpu,
  Car,
  Factory,
  Shield,
  Swords,
  Bug,
  Rabbit,
} from "lucide-react";

interface CategoryTabsProps {
  selectedCategory: ItemCategory;
  onSelectCategory: (category: ItemCategory) => void;
}

const CATEGORY_ICONS: Record<ItemCategory, React.ReactNode> = {
  storage: <Import className="h-4 w-4" />,
  production: <Pickaxe className="h-4 w-4" />,
  processing: <Cpu className="h-4 w-4" />,
  functional: <Parentheses className="h-4 w-4" />,
  vehicle: <Car className="h-4 w-4" />,
  weapon: <Swords className="h-4 w-4" />,
  infection: <Rabbit className="h-4 w-4" />,
};

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const categories = Object.keys(CATEGORY_LABELS) as ItemCategory[];

  return (
    <Tabs
      value={selectedCategory}
      onValueChange={(value) => onSelectCategory(value as ItemCategory)}>
      <TabsList className="h-11 w-full">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className="cursor-pointer">
            {CATEGORY_ICONS[category]}
            <span className="">{CATEGORY_LABELS[category]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
