"use client";

import React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/base/separator";
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className="py-2">
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
          className
        )}>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      <Separator className="mt-4 w-full " />
    </div>
  );
}
