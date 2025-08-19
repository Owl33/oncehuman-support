import { LucideIcon } from "lucide-react";
import { CategoryVariant } from "./variants";

/**
 * 카테고리 설정 타입
 */
export interface CategoryConfig {
  title: string;
  icon: LucideIcon;
  variant: CategoryVariant;
}

/**
 * 카테고리 섹션 Props
 */
export interface CategorySectionProps {
  /** 카테고리 키 */
  category: CategoryVariant;
  /** 카테고리 제목 */
  title?: string;
  /** 카테고리 아이콘 */
  icon: LucideIcon;
  /** 표시 모드 */
  mode?: "compact" | "modern";
  /** 완료된 아이템 수 */
  completedCount?: number;
  /** 전체 아이템 수 */
  totalCount?: number;
  /** 진행률 숨기기 여부 (시간별 이벤트의 경우) */
  hideProgress?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
}

/**
 * 카테고리 헤더 Props
 */
export interface CategoryHeaderProps {
  category: CategoryVariant;
  title: string;
  icon: LucideIcon;
  mode: "compact" | "modern";
  completedCount?: number;
  totalCount?: number;
  hideProgress?: boolean;
  className?: string;
}

/**
 * 카테고리 아이콘 Props
 */
export interface CategoryIconProps {
  icon: LucideIcon;
  variant: CategoryVariant;
  size: "compact" | "modern";
  className?: string;
}

/**
 * 카테고리 통계 Props
 */
export interface CategoryStatsProps {
  completedCount: number;
  totalCount: number;
  hideProgress?: boolean;
  mode: "compact" | "modern";
  variant: CategoryVariant;
}