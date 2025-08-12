// app/settings/page.tsx
import { ComingSoon } from "@/components/ui/coming-soon";

export default function SettingsPage() {
  return (
    <ComingSoon 
      title="설정"
      description="언어 설정, 테마 변경, 알림 설정 등 다양한 개인화 옵션을 제공할 예정입니다."
      expectedDate="2024년 3월 예정"
    />
  );
}