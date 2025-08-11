"use client";

import React from "react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/base/card";
import { Button } from "@/components/base/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="container mx-auto py-20">
      <div className="max-w-md mx-auto">
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                {icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground mb-6">
                {description}
              </p>
              {actionLabel && onAction && (
                <Button onClick={onAction} className="gap-2">
                  {actionLabel}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}