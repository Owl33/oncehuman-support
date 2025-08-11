"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ViewModeToggle } from "@/components/actions/view-mode-toggle";
import { useSwitchPointContext } from "../contexts/switch-point-context";

export function SwitchPointHeader() {
  const { viewMode, changeViewMode } = useSwitchPointContext();

  const actions = (
    <ViewModeToggle
      viewMode={viewMode}
      onViewModeChange={changeViewMode}
    />
  );

  return (
    <PageHeader
      title="서버 이전 포인트 계산"
      description="서버 이전에 필요한 재료와 포인트를 계산합니다"
      actions={actions}
    />
  );
}