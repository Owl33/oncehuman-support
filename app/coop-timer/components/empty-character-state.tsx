"use client";

import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/base/button";
import { Users } from "lucide-react";

export function EmptyCharacterState() {
  return (
    <EmptyState
      icon={<Users className="h-6 w-6" />}
      title="캐릭터가 없습니다"
      description="협동 타이머를 사용하려면 먼저 캐릭터를 등록해주세요."
      action={
        <Button>
          캐릭터 등록하기
        </Button>
      }
    />
  );
}