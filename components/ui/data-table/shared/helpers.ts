// components/ui/data-table/shared/helpers.ts
import { SYSTEM_COLUMN_IDS, BREAKPOINTS } from "./constants";
import type { ColumnAnalysis } from "./types";

/**
 * 시스템 컬럼인지 확인
 */
export function isSystemColumn(columnId: string): boolean {
  return SYSTEM_COLUMN_IDS.includes(columnId as any);
}

/**
 * 편집 가능한 컬럼인지 확인
 */
export function isEditableColumn(column: any): boolean {
  return !isSystemColumn(column.id) && column.columnDef?.meta?.editable === true;
}

/**
 * 화면 크기 기반 디바이스 타입 판별
 */
export function getDeviceType(screenWidth: number) {
  if (screenWidth < BREAKPOINTS.mobile) return "mobile";
  if (screenWidth < BREAKPOINTS.tablet) return "tablet";
  return "desktop";
}

/**
 * 컬럼 분석 함수
 */
export function analyzeColumns(columns: any[]): ColumnAnalysis {
  let fixedWidth = 0;
  let autoColumnsCount = 0;
  let editableColumns = 0;
  let systemColumns = 0;
  let hasResponsiveColumns = false;

  columns.forEach((column) => {
    const meta = column.columnDef?.meta;
    const size = column.getSize?.() || 0;

    // 시스템 컬럼 카운트
    if (isSystemColumn(column.id)) {
      systemColumns++;
    }

    // 편집 가능 컬럼 카운트
    if (isEditableColumn(column)) {
      editableColumns++;
    }

    // 너비 분석
    if (size > 0) {
      fixedWidth += size;
    } else {
      autoColumnsCount++;
    }

    // 반응형 컬럼 체크
    if (meta?.priority) {
      hasResponsiveColumns = true;
    }
  });

  return {
    totalColumns: columns.length,
    editableColumns,
    systemColumns,
    fixedWidth,
    autoColumnsCount,
    hasResponsiveColumns,
  };
}

/**
 * 문자열에서 텍스트 컨텐츠 추출
 */
export function extractTextContent(value: any): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return '';
}

/**
 * 디바운스 함수
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * 깊은 복사 함수 (간단한 객체용)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === "object") {
    const clonedObj = {} as any;
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone((obj as any)[key]);
    });
    return clonedObj;
  }
  return obj;
}