"use client";

import { Card } from "@/components/base/card";
import { EmptyState } from "@/components/states/empty-state";
import { Users } from "lucide-react";

export function NoCharacterSelected() {
  return (
    <Card className="p-12">
      <EmptyState
        icon={<Users className="h-12 w-12 text-gray-400" />}
        title="캐릭터를 선택해주세요"
        description="협동 타이머를 보려면 왼쪽에서 캐릭터를 선택해주세요."
      />
    </Card>
  );
}