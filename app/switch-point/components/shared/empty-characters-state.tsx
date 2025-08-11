"use client";

import React from "react";
import { EmptyState } from "@/components/states/empty-state";
import { UserPlus } from "lucide-react";

export function EmptyCharactersState() {
  const handleGoToCharacters = () => {
    window.location.href = "/character";
  };

  return (
    <EmptyState
      icon={<UserPlus className="h-6 w-6 text-muted-foreground" />}
      title="캐릭터가 없습니다"
      description="Switch Point를 계산하려면 먼저 캐릭터를 등록해야 합니다. 캐릭터 관리 페이지에서 캐릭터를 생성해주세요."
      actionLabel="캐릭터 등록하러 가기"
      onAction={handleGoToCharacters}
    />
  );
}