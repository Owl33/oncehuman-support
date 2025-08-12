// app/coop-timer/page.tsx
import { ComingSoon } from "@/components/ui/coming-soon";

export default function CoopTimerPage() {
  return (
    <ComingSoon 
      title="협동 타이머"
      description="협동 미션과 이벤트 타이머를 제공할 예정입니다. 서버별 리셋 시간과 협동 콘텐츠 스케줄을 확인할 수 있습니다."
      expectedDate="2024년 1월 예정"
    />
  );
}