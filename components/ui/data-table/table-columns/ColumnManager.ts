// components/ui/data-table/table-columns/ColumnManager.ts
import { COLUMN_PRIORITIES, BREAKPOINTS } from "../shared/constants";
import type { ColumnPriority, ColumnAnalysis } from "../shared/types";
import { isSystemColumn, analyzeColumns } from "../shared/helpers";

export interface ColumnPriorityConfig {
  id: string;
  priority: ColumnPriority;
  mobileOrder?: number;
  collapsedWidth?: string;
}

export interface ResponsiveColumnConfig {
  visibleColumns: any[];
  hiddenColumns: any[];
}

export interface ColumnCategories {
  primaryColumns: any[];
  secondaryColumns: any[];
  systemColumns: any[];
  hasCollapsibleContent: boolean;
}

/**
 * 통합된 컬럼 관리 클래스
 */
export class ColumnManager {
  
  /**
   * 컬럼을 우선순위별로 분류
   */
  static categorizeByPriority(columns: any[]): ColumnCategories {
    const primaryColumns: any[] = [];
    const secondaryColumns: any[] = [];
    const systemColumns: any[] = [];

    columns.forEach(column => {
      const priority = column.columnDef?.meta?.priority || COLUMN_PRIORITIES.SECONDARY;
      
      if (isSystemColumn(column.id)) {
        systemColumns.push(column);
      } else if (priority === COLUMN_PRIORITIES.PRIMARY) {
        primaryColumns.push(column);
      } else {
        secondaryColumns.push(column);
      }
    });

    return {
      primaryColumns,
      secondaryColumns,
      systemColumns,
      hasCollapsibleContent: secondaryColumns.length > 0
    };
  }

  /**
   * 화면 크기와 컨텐츠 기반으로 collapse 모드 판별
   */
  static shouldUseCollapseMode(
    screenWidth: number,
    hasCollapsibleContent: boolean
  ): boolean {
    return screenWidth < BREAKPOINTS.tablet && hasCollapsibleContent;
  }

  /**
   * 반응형 컬럼 설정 계산
   */
  static getResponsiveConfig(
    allColumns: any[],
    isCollapseMode: boolean
  ): ResponsiveColumnConfig {
    const { primaryColumns, secondaryColumns, systemColumns } = 
      this.categorizeByPriority(allColumns);

    if (!isCollapseMode) {
      return {
        visibleColumns: [...systemColumns, ...primaryColumns, ...secondaryColumns],
        hiddenColumns: []
      };
    }

    return {
      visibleColumns: [...systemColumns, ...primaryColumns],
      hiddenColumns: secondaryColumns
    };
  }

  /**
   * 컬럼 분석 (기존 함수 래핑)
   */
  static analyze(columns: any[]): ColumnAnalysis {
    return analyzeColumns(columns);
  }

  /**
   * 컬럼 너비 계산
   */
  static calculateWidths(columns: any[]): {
    fixedColumns: any[];
    autoColumns: any[];
    totalFixedWidth: number;
  } {
    const fixedColumns: any[] = [];
    const autoColumns: any[] = [];
    let totalFixedWidth = 0;

    columns.forEach((column) => {
      const size = column.getSize?.() || 0;
      const meta = column.columnDef?.meta;

      if (size > 0 || meta?.width) {
        fixedColumns.push(column);
        totalFixedWidth += size;
      } else {
        autoColumns.push(column);
      }
    });

    return {
      fixedColumns,
      autoColumns,
      totalFixedWidth,
    };
  }

  /**
   * 모바일 최적화된 컬럼 순서 계산
   */
  static getMobileColumnOrder(columns: any[]): any[] {
    return [...columns].sort((a, b) => {
      const aMobileOrder = a.columnDef?.meta?.mobileOrder || 999;
      const bMobileOrder = b.columnDef?.meta?.mobileOrder || 999;
      return aMobileOrder - bMobileOrder;
    });
  }

  /**
   * 기본 우선순위 설정들
   */
  static getDefaultPriorityConfigs() {
    return {
      character: [
        { id: 'name', priority: COLUMN_PRIORITIES.PRIMARY, mobileOrder: 1 },
        { id: 'server', priority: COLUMN_PRIORITIES.PRIMARY, mobileOrder: 2 },
        { id: 'scenario', priority: COLUMN_PRIORITIES.SECONDARY },
        { id: 'job', priority: COLUMN_PRIORITIES.SECONDARY },
        { id: 'desc', priority: COLUMN_PRIORITIES.SECONDARY },
      ]
    };
  }
}