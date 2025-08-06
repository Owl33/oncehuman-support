// app/switchpoint/components/category-tabs.tsx
"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/base/tabs";
import { ItemCategory, CATEGORY_LABELS } from "@/types/switchpoint";
import { Package, Trees, Factory, Shield, Wrench, Swords, Bug } from "lucide-react";

interface CategoryTabsProps {
  selectedCategory: ItemCategory;
  onSelectCategory: (category: ItemCategory) => void;
}

const CATEGORY_ICONS: Record<ItemCategory, React.ReactNode> = {
  storage: <Package className="h-4 w-4" />,
  production: <Trees className="h-4 w-4" />,
  processing: <Trees className="h-4 w-4" />,
  vehicle: <Trees className="h-4 w-4" />,
  functional: <Shield className="h-4 w-4" />,
  weapon: <Swords className="h-4 w-4" />,
  infection: <Bug className="h-4 w-4" />,
};

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const categories = Object.keys(CATEGORY_LABELS) as ItemCategory[];

  return (
    <Tabs
      value={selectedCategory}
      onValueChange={(value) => onSelectCategory(value as ItemCategory)}>
      <TabsList className="">
        {categories.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            className="">
            {CATEGORY_ICONS[category]}
            <span className="text-xs">{CATEGORY_LABELS[category]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
