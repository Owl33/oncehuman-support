"use client";

import { useMemo } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { PageContent } from "@/components/layout/page-content";
import { PageLoading } from "@/components/states/page-loading";
import { SwitchPointProvider, useSwitchPointContext } from "./contexts/switch-point-context";
import { SwitchPointHeader } from "./components/switch-point-header";
import { DashboardWrapper } from "./components/content/dashboard/dashboard-wrapper";
import { DetailLayout } from "./components/content/detail/detail-layout";
import { EmptyCharactersState } from "./components/shared/empty-characters-state";

function SwitchPointPageContent() {
  const { loading, viewMode, characters, selectedCharacterId } = useSwitchPointContext();

  // 현재 선택된 캐릭터
  const currentCharacter = useMemo(
    () => characters.find(c => c.id === selectedCharacterId),
    [characters, selectedCharacterId]
  );

  if (loading) {
    return <PageLoading message="데이터를 불러오는 중..." />;
  }

  if (characters.length === 0) {
    return (
      <PageLayout>
        <SwitchPointHeader />
        <EmptyCharactersState />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SwitchPointHeader />
      <PageContent>
        {viewMode === "dashboard" ? (
          <DashboardWrapper />
        ) : (
          <DetailLayout currentCharacter={currentCharacter} />
        )}
      </PageContent>
    </PageLayout>
  );
}

export default function SwitchPointPage() {
  return (
    <SwitchPointProvider>
      <SwitchPointPageContent />
    </SwitchPointProvider>
  );
}
