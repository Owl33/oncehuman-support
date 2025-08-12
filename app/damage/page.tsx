// app/damage/page.tsx
import { ComingSoon } from "@/components/ui/coming-soon";

export default function DamagePage() {
  return (
    <ComingSoon 
      title="데미지 계산기"
      description="무기별 데미지 계산과 최적화 도구를 준비하고 있습니다. 다양한 무기의 DPS 비교와 빌드 추천 기능을 제공할 예정입니다."
      expectedDate="2024년 2월 예정"
    />
  );
}