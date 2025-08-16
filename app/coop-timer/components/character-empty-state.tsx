"use client";

import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/base/button";
import { Card } from "@/components/base/card";
import { Users } from "lucide-react";
import Link from "next/link";

interface CharacterEmptyStateProps {
  type: "no-characters" | "no-selection";
}

export function CharacterEmptyState({ type }: CharacterEmptyStateProps) {
  if (type === "no-characters") {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="캐릭터가 없습니다"
        description="협동 타이머를 사용하려면 먼저 캐릭터를 등록해주세요."
        action={
          <Link href="/character">
            <Button>
              캐릭터 등록하기
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <Card className="p-12">
      <EmptyState
        icon={<Users className="h-12 w-12 text-gray-400" />}
        title="캐릭터를 선택해주세요"
        description="협동 타이머를 보려면 위에서 캐릭터를 선택해주세요."
      />
    </Card>
  );
}