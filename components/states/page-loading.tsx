"use client";

import React from "react";

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "데이터를 불러오는 중..." }: PageLoadingProps) {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}