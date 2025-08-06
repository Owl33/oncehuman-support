//app/character/page.tsx
"use client";

import { columns } from "./table/columns";
import { DataTable } from "@/components/ui";
import { Button } from "@/components/base/button";
import { Plus, Download, Upload, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { DataTableRef } from "@/components/ui/data-table";
import { characterStorage } from "@/lib/storage/character-storage";
import { CharacterData } from "@/types/character";

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
import { toast } from "sonner";

export default function CharacterPage() {
  const [data, setData] = useState<CharacterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const tableRef = useRef<DataTableRef<CharacterData>>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const characters = await characterStorage.getCharacters();
      setData(characters);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("캐릭터 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 유효성 검사 함수
  const validateCharacterData = (saveData: {
    updatedRows: CharacterData[];
    newRow: CharacterData | null;
  }) => {
    const errors: string[] = [];

    // 새로운 행 검증
    if (saveData.newRow) {
      if (!saveData.newRow.name?.trim()) errors.push("• 캐릭터 이름은 필수입니다");
      if (!saveData.newRow.scenario?.trim()) errors.push("• 시나리오는 필수입니다");
      if (!saveData.newRow.server?.trim()) errors.push("• 서버는 필수입니다");
      if (!saveData.newRow.job?.trim()) errors.push("• 직업은 필수입니다");

      // 중복 이름 검사
      if (
        saveData.newRow.name?.trim() &&
        data.some((existing) => existing.name === saveData.newRow?.name?.trim())
      ) {
        errors.push("• 이미 존재하는 캐릭터 이름입니다");
      }
    }

    // 수정된 행들 검증
    saveData.updatedRows.forEach((row, index) => {
      const prefix = `${index + 1}번째 행: `;
      if (!row.name?.trim()) errors.push(`• ${prefix}캐릭터 이름은 필수입니다`);
      if (!row.scenario?.trim()) errors.push(`• ${prefix}시나리오는 필수입니다`);
      if (!row.server?.trim()) errors.push(`• ${prefix}서버는 필수입니다`);
      if (!row.job?.trim()) errors.push(`• ${prefix}직업은 필수입니다`);
    });

    return errors;
  };

  // 저장 핸들러
  const handleSave = async (saveData: {
    updatedRows: CharacterData[];
    newRow: CharacterData | null;
  }) => {
    // 유효성 검사
    const errors = validateCharacterData(saveData);
    if (errors.length > 0) {
      toast.error("입력 정보를 확인해주세요", {
        description: errors.join("\n"),
      });
      return;
    }

    try {
      // 업데이트된 행들 처리
      if (saveData.updatedRows.length > 0) {
        await characterStorage.updateCharacters(saveData.updatedRows);
        toast.success(`${saveData.updatedRows.length}개의 캐릭터가 수정되었습니다.`);
      }

      // 새로 추가된 행 처리
      if (saveData.newRow) {
        await characterStorage.createCharacter(saveData.newRow);
        toast.success(`새 캐릭터 '${saveData.newRow.name}'가 추가되었습니다.`);
      }

      // 성공시에만 편집 모드 종료
      tableRef.current?.completeSave();

      // 데이터 새로고침
      await loadData();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("캐릭터 정보 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 삭제 핸들러
  const handleDelete = async (deleteData: CharacterData[]) => {
    const confirmMessage =
      deleteData.length === 1
        ? `'${deleteData[0].name}' 캐릭터를 삭제하시겠습니까?`
        : `선택된 ${deleteData.length}개의 캐릭터를 삭제하시겠습니까?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await characterStorage.deleteCharacters(deleteData.map((item) => item.id));
      toast.success(`${deleteData.length}개의 캐릭터가 삭제되었습니다.`);
      await loadData();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("캐릭터 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 데이터 내보내기
  const handleExport = async () => {
    try {
      const jsonData = await characterStorage.exportData();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `characters_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("캐릭터 데이터를 내보냈습니다.");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("데이터 내보내기에 실패했습니다.");
    }
  };

  // 데이터 가져오기
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await characterStorage.importData(text);
      await loadData();

      toast.success("캐릭터 데이터를 가져왔습니다.");
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("올바른 형식의 파일이 아닙니다.");
    }

    // 파일 입력 초기화
    if (event.target) {
      event.target.value = "";
    }
  };

  // 전체 데이터 초기화
  const handleClearAll = async () => {
    try {
      await characterStorage.clearAll();
      await loadData();
      setShowClearDialog(false);

      toast.success("모든 캐릭터 데이터가 삭제되었습니다.");
    } catch (error) {
      console.error("Clear failed:", error);
      toast.error("데이터 초기화에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">캐릭터 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="border-b">
        <div className="mx-auto py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">캐릭터 관리</h1>
              <p className="text-sm text-muted-foreground mt-1">
                캐릭터를 관리합니다. 데이터는 브라우저에 저장됩니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* 데이터 관리 버튼들 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                가져오기
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearDialog(true)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                초기화
              </Button>

              <div className="w-px h-6 bg-border mx-2" />

              {/* 캐릭터 추가 버튼 */}
              <Button
                variant="default"
                onClick={() => tableRef.current?.startAdd()}
                disabled={tableRef.current?.isInEditMode}>
                <Plus className="h-4 w-4 mr-2" />
                캐릭터 추가
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        ref={tableRef}
        columns={columns}
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
    </div>
  );
}
