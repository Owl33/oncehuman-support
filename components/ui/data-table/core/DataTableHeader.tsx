// components/ui/data-table/core/DataTableHeader.tsx
"use client";
import React from "react";

interface DataTableHeaderProps {
  customHeaderContent?: React.ReactNode;
}

export function DataTableHeader({ customHeaderContent }: DataTableHeaderProps) {
  if (!customHeaderContent) return null;

  return (
    <div className="mb-4">
      {customHeaderContent}
    </div>
  );
}