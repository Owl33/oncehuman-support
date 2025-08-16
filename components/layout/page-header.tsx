"use client";

import React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/base/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <div className="py-2">
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
          className
        )}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-6 w-6 text-primary" />}
            <h1 className="text-xl md:text-2xl font-bold truncate">{title}</h1>
          </div>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm md:text-base">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      <Separator className="my-4 w-full " />
    </div>
  );
}
