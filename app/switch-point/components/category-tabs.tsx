// app/switchpoint/components/category-tabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/base/tabs";
import { ItemCategory, CATEGORY_LABELS } from "@/types/character";
import { Import, Package, Trees, Factory, Shield, Wrench, Swords, Bug } from "lucide-react";

interface CategoryTabsProps {
  selectedCategory: ItemCategory;
  onSelectCategory: (category: ItemCategory) => void;
}

const CATEGORY_ICONS: Record<ItemCategory, React.ReactNode> = {
  storage: <Import className="h-4 w-4" />,
  production: <Factory className="h-4 w-4" />,
  processing: <Factory className="h-4 w-4" />,
  functional: <Factory className="h-4 w-4" />,
  vehicle: <Swords className="h-4 w-4" />,
  weapon: <Swords className="h-4 w-4" />,
  infection: <Bug className="h-4 w-4" />,
};

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const categories = Object.keys(CATEGORY_LABELS) as ItemCategory[];

  return (
    <Tabs
      className="my-4"
      value={selectedCategory}
      onValueChange={(value) => onSelectCategory(value as ItemCategory)}>
      <TabsList className="w-full">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className=" py-4 ">
            {CATEGORY_ICONS[category]}
            <span className="">{CATEGORY_LABELS[category]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
