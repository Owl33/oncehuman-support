//app/character/page.tsx
"use client";

import { columns } from "./table/columns";
import { DataTable } from "@/components/ui";
import { Button } from "@/components/base/button";
import { Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { DataTableRef } from "@/components/ui/data-table"; // 기존 타입 사용

export type Payment = {
  id: string;
  scenario: string;
  server: string;
  name: string;
  job: string;
  desc?: string;
};

// 알림 타입 정의
type NotificationType = "success" | "error" | "warning";

interface NotificationOptions {
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

// 실제 api 통신을 통해 가져올 데이터, 현재는 local로 작성함 추후 변경 예정
async function getData(): Promise<Payment[]> {
  return [
    {
      id: "7258ed412352f",
      scenario: "무한한 꿈",
      server: "X-0011",
      name: "Owl33",
      job: "메타 휴먼",
      desc: "본캐",
    },
    {
      id: "7258ed412353g",
      scenario: "터치 오브 스카이",
      server: "X-0091",
      name: "Owlasqqq213",
      job: "공예사",
      desc: "부캐",
    },
    {
      id: "7258ed412354h",
      scenario: "무한한 꿈",
      server: "X-0011",
      name: "Ozxc22",
      job: "요리사",
      desc: "농사용",
    },
    {
      id: "7258ed412355i",
      scenario: "터치 오브 스카이",
      server: "X-0091",
      name: "Owvbnl3",
      job: "공예사",
      desc: "부캐",
    },
    {
      id: "7258ed412356j",
      scenario: "무한한 꿈",
      server: "X-0011",
      name: "O2xcv2",
      job: "요리사",
      desc: "농사용",
    },
    {
      id: "7258ed412357k",
      scenario: "무한한 꿈",
      server: "X-0011",
      name: "Owhgfl33",
      job: "조련사",
      desc: "스더광 영지",
    },
    // ... 나머지 데이터들
  ];
}

export default function CharacterPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<DataTableRef<Payment>>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getData();
      setData(result);
    } catch (error) {
      console.error("Failed to load data:", error);
      showNotification({
        type: "error",
        title: "데이터 로드 실패",
        message: "캐릭터 데이터를 불러오는데 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 알림 표시 함수 (현재는 alert, 추후 toast/floating으로 교체)
  const showNotification = (options: NotificationOptions) => {
    // 현재는 alert 사용
    const message = options.title ? `${options.title}\n${options.message}` : options.message;

    alert(message);

    // TODO: 추후 toast/floating notification으로 교체
    // toast({
    //   variant: options.type === 'error' ? 'destructive' : 'default',
    //   title: options.title,
    //   description: options.message,
    //   duration: options.duration || 5000,
    // });
  };

  // 유효성 검사 함수
  const validateCharacterData = (saveData: { updatedRows: Payment[]; newRow: Payment | null }) => {
    const errors: string[] = [];

    // 새로운 행 검증
    if (saveData.newRow) {
      if (!saveData.newRow.name?.trim()) errors.push("• 캐릭터 이름은 필수입니다");
      if (!saveData.newRow.scenario?.trim()) errors.push("• 시나리오는 필수입니다");
      if (!saveData.newRow.server?.trim()) errors.push("• 서버는 필수입니다");
      if (!saveData.newRow.job?.trim()) errors.push("• 직업은 필수입니다");

      // 중복 이름 검사 - 기존 데이터와 중복되는지 확인
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
  const handleSave = async (saveData: { updatedRows: Payment[]; newRow: Payment | null }) => {
    console.log("Save data:", saveData);

    // 유효성 검사
    const errors = validateCharacterData(saveData);
    if (errors.length > 0) {
      showNotification({
        type: "warning",
        title: "입력 정보를 확인해주세요",
        message: errors.join("\n"),
      });
      return; // 편집 모드 유지 - completeSave() 호출하지 않음
    }

    try {
      // 업데이트된 행들 처리
      if (saveData.updatedRows.length > 0) {
        console.log("Updated rows:", saveData.updatedRows);
        // await updateCharacters(saveData.updatedRows);

        showNotification({
          type: "success",
          message: `${saveData.updatedRows.length}개의 캐릭터가 수정되었습니다.`,
        });
      }

      // 새로 추가된 행 처리
      if (saveData.newRow) {
        console.log("New row:", saveData.newRow);
        // await createCharacter(saveData.newRow);

        showNotification({
          type: "success",
          message: `새 캐릭터 '${saveData.newRow.name}'가 추가되었습니다.`,
        });
      }

      console.log("✅ Save completed successfully");

      // 성공시에만 편집 모드 종료
      tableRef.current?.completeSave();

      // 데이터 새로고침
      await loadData();
    } catch (error) {
      console.error("❌ Save failed:", error);
      showNotification({
        type: "error",
        title: "저장 실패",
        message: "캐릭터 정보 저장에 실패했습니다. 다시 시도해주세요.",
      });
      // 편집 모드 유지됨 - completeSave() 호출하지 않음
    }
  };

  // 삭제 핸들러
  const handleDelete = async (deleteData: Payment[]) => {
    console.log("Delete rows:", deleteData);

    // 삭제 확인
    const confirmMessage =
      deleteData.length === 1
        ? `'${deleteData[0].name}' 캐릭터를 삭제하시겠습니까?`
        : `선택된 ${deleteData.length}개의 캐릭터를 삭제하시겠습니까?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      // await deleteCharacters(deleteData.map(item => item.id));

      console.log("✅ Delete completed successfully");

      showNotification({
        type: "success",
        message: `${deleteData.length}개의 캐릭터가 삭제되었습니다.`,
      });

      await loadData();
    } catch (error) {
      console.error("❌ Delete failed:", error);
      showNotification({
        type: "error",
        title: "삭제 실패",
        message: "캐릭터 삭제에 실패했습니다. 다시 시도해주세요.",
      });
    }
  };

  // 캐릭터 추가 버튼 핸들러
  const handleAddCharacter = () => {
    tableRef.current?.startAdd();
  };

  // 현재 편집 상태 확인
  const isInEditMode = tableRef.current?.isInEditMode || false;
  const isAddMode = tableRef.current?.isAddMode || false;

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
    <div className=" mx-auto ">
      <div className="border-b">
        <div className=" mx-auto py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">캐릭터 관리</h1>
              <p className="text-sm text-muted-foreground mt-1">
                캐릭터를 관리합니다. 현재 버전에서는 브라우저의 데이터를 초기화하면 데이터가
                사라집니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* 뷰 모드 전환 */}
              <Button
                variant="default"
                onClick={handleAddCharacter}
                disabled={isInEditMode}>
                <Plus className="h-4 w-4 mr-2" />
                {isAddMode ? "추가 중..." : "캐릭터 추가"}
              </Button>

              {/* 편집 중일 때 취소 버튼 표시 (선택사항) */}
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
    </div>
  );
}
