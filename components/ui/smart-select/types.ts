import { LucideIcon } from "lucide-react";

/**
 * 아이템에서 값을 추출하는 함수 또는 속성명
 */
export type ItemExtractor<T> = string | ((item: T) => string);

/**
 * 아이템에서 boolean 값을 추출하는 함수 또는 속성명  
 */
export type ItemBooleanExtractor<T> = string | ((item: T) => boolean);

/**
 * SmartSelect 컴포넌트의 Props 인터페이스 (Vuetify v-select 스타일)
 * Generic 타입 T로 다양한 데이터 구조 지원
 */
export interface SmartSelectProps<T> {
  // ===== Data Props =====
  /** 선택 옵션 배열 */
  items: T[];
  /** 현재 선택된 값 (단일) 또는 값 배열 (다중) */
  value?: string | string[] | null;
  /** 값 변경 시 호출되는 콜백 */
  onChange: (value: string | string[]) => void;
  
  // ===== Item Extractors (Vuetify 스타일) =====
  /** 아이템에서 표시 텍스트를 추출 (속성명 또는 함수) */
  itemText: ItemExtractor<T>;
  /** 아이템에서 값을 추출 (속성명 또는 함수) */
  itemValue: ItemExtractor<T>;
  /** 아이템 비활성화 여부 추출 (선택사항) */
  itemDisabled?: ItemBooleanExtractor<T>;
  
  // ===== Behavior Props =====
  /** 선택 해제 가능 여부 */
  clearable?: boolean;
  /** 다중 선택 가능 여부 */
  multiple?: boolean;
  /** 다중 선택 시 칩 형태로 표시 */
  chips?: boolean;
  /** 값 대신 전체 객체 반환 */
  returnObject?: boolean;
  /** 밀도 높은 스타일 */
  dense?: boolean;
  
  // ===== Render Customization =====
  /** 선택된 아이템의 커스텀 렌더링 */
  renderSelected?: (item: T) => React.ReactNode;
  /** 드롭다운 옵션의 커스텀 렌더링 */
  renderOption?: (item: T) => React.ReactNode;
  /** 다중 선택 칩의 커스텀 렌더링 */
  renderChip?: (item: T, onRemove: () => void) => React.ReactNode;
  
  // ===== UI Props =====
  /** 라벨 텍스트 */
  label?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 앞쪽 아이콘 */
  prependIcon?: LucideIcon;
  /** 뒤쪽 아이콘 */
  appendIcon?: LucideIcon;
  /** 아이템이 없을 때 표시할 내용 */
  emptyState?: React.ReactNode;
  /** 도움말 텍스트 */
  hint?: string;
  /** 에러 메시지 */
  errorMessage?: string;
  /** 세부사항 숨김 */
  hideDetails?: boolean;
  
  // ===== Style Props =====
  /** 추가 CSS 클래스 */
  className?: string;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
}

/**
 * 내부에서 사용하는 아이템 처리 유틸리티 타입들
 */
export interface ProcessedItem<T> {
  /** 원본 아이템 */
  item: T;
  /** 추출된 값 */
  value: string;
  /** 추출된 텍스트 */
  text: string;
  /** 비활성화 여부 */
  disabled: boolean;
}

/**
 * 기본 렌더링 함수들의 타입
 */
export type RenderFunction<T> = (item: T) => React.ReactNode;
export type ChipRenderFunction<T> = (item: T, onRemove: () => void) => React.ReactNode;
export type ExtractorFunction<T> = (item: T) => string;
export type BooleanExtractorFunction<T> = (item: T) => boolean;

/**
 * 컴포넌트 내부 상태 타입
 */
export interface SmartSelectState {
  /** 드롭다운 열림 상태 */
  isOpen: boolean;
  /** 포커스 상태 */
  isFocused: boolean;
  /** 검색 텍스트 (향후 확장용) */
  searchText: string;
}