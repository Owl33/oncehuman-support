"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { PageLoading } from "@/components/states/page-loading";
import { CharacterHeader } from "./components/character-header";
import { CharacterTable } from "./components/content/character-table";
import { useCharacterManagement } from "./hooks/use-character-management";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/base/alert-dialog";

export default function CharacterPage() {
  const {
    data,
    loading,
    showClearDialog,
    setShowClearDialog,
    tableRef,
    handleSave,
    handleDelete,
    handleExport,
    handleImport,
    handleClearAll,
    handleAddCharacter,
    isEditMode
  } = useCharacterManagement();

  if (loading) {
    return <PageLoading message="캐릭터 정보를 불러오는 중..." />;
  }

  return (
    <PageLayout>
      <CharacterHeader
        onExport={handleExport}
        onImport={handleImport}
        onClearAll={() => setShowClearDialog(true)}
        onAddCharacter={handleAddCharacter}
        isEditMode={!!isEditMode}
      />

      <CharacterTable
        tableRef={tableRef}
        data={data}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* 초기화 확인 다이얼로그 */}
      <AlertDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>모든 데이터를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              저장된 모든 캐릭터 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}