"use client";

import React from "react";
import { Button } from "@/components/base/button";
import { LayoutGrid, ListFilter } from "lucide-react";
import type { ViewMode } from "@/types/character";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center rounded-lg border gap-1 p-1">
      <Button
        variant={viewMode === "dashboard" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("dashboard")}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        대시보드
      </Button>
      <Button
        variant={viewMode === "detail" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("detail")}
        className="gap-2"
      >
        <ListFilter className="h-4 w-4" />
        상세편집
      </Button>
    </div>
  );
}