// app/switchpoint/components/category-tabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/base/tabs";
import { ItemCategory, CATEGORY_LABELS } from "@/types/character";
import { Import, Pickaxe, Parentheses, Cpu, Car, Swords, Rabbit } from "lucide-react";

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
  weapons: <Swords className="h-4 w-4" />,
  infections: <Rabbit className="h-4 w-4" />,
};

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const categories = Object.keys(CATEGORY_LABELS) as ItemCategory[];

  return (
    <Tabs
      value={selectedCategory}
      onValueChange={(value) => onSelectCategory(value as ItemCategory)}>
      <TabsList className="flex h-11 w-full overflow-x-auto">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className="cursor-pointer flex-shrink-0 min-w-fit"
            title={CATEGORY_LABELS[category]}>
            {CATEGORY_ICONS[category]}
            <span className="hidden sm:inline ml-2">{CATEGORY_LABELS[category]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
