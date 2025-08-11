"use client";

import React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("py-4 md:py-6", className)}>
      {children}
    </div>
  );
}