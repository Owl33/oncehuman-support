import { LucideIcon } from "lucide-react";
import { EventCardVariant } from "./variants";

/**
 * 이벤트 카드 기본 Props
 */
export interface BaseEventCardProps {
  /** 카테고리 variant */
  variant: EventCardVariant;
  /** 이벤트 이름 */
  title: string;
  /** 이벤트 아이콘 */
  icon?: LucideIcon;
  /** 이벤트 이모지 */
  emoji?: string;
  /** 완료 상태 */
  completed: boolean;
  /** 클릭 핸들러 */
  onToggle: (completed: boolean) => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * Compact 이벤트 카드 Props
 */
export interface CompactEventCardProps extends BaseEventCardProps {
  /** 다음 리셋 시간 텍스트 */
  nextResetText: string;
}

/**
 * Modern 이벤트 카드 Props  
 */
export interface ModernEventCardProps extends BaseEventCardProps {
  /** 이벤트 설명 */
  description?: string;
  /** 다음 리셋 시간 텍스트 */
  nextResetText: string;
  /** 이전 완료 시간 텍스트 */
  lastCompletedText?: string;
  /** 이벤트 범위 */
  scope?: "common" | "scenario";
}