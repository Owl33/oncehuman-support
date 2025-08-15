// components/ui/data-table/table-columns/ColumnManager.ts
import {  BREAKPOINTS } from "../shared/constants";
import type { MobileVisibility, ColumnAnalysis } from "../shared/types";
import { isSystemColumn, analyzeColumns } from "../shared/helpers";

export interface MobileColumnConfig {
  id: string;
  mobileVisibility: MobileVisibility;
  mobileOrder?: number;
  collapsedWidth?: string;
}

export interface ResponsiveColumnConfig {
  visibleColumns: any[];
  hiddenColumns: any[];
}

export interface ColumnCategories {
  visibleColumns: any[];
  hiddenColumns: any[];
  systemColumns: any[];
  hasCollapsibleContent: boolean;
}

/**
 * 통합된 컬럼 관리 클래스
 */
export class ColumnManager {
  
  /**
   * 컬럼을 모바일 동작별로 분류
   */
  static categorizeByMobileBehavior(columns: any[]): ColumnCategories {
    const visibleColumns: any[] = [];
    const hiddenColumns: any[] = [];
    const systemColumns: any[] = [];

    // 먼저 시스템 컬럼과 일반 컬럼을 분리
    const normalColumns = columns.filter(column => !isSystemColumn(column.id));
    const systemCols = columns.filter(column => isSystemColumn(column.id));

    // 일반 컬럼들에 대해서만 인덱스 기반 자동 판단
    normalColumns.forEach((column, index) => {
      // meta.mobileVisibility가 명시적으로 설정되어 있으면 그것을 사용
      let visibility = column.columnDef?.meta?.mobileVisibility;
      
      // 설정되지 않았으면 자동 판단 (시스템 컬럼 제외한 인덱스 사용)
      if (!visibility) {
        const shouldBeVisible = this.shouldColumnBeVisibleOnMobile(column, index);
        visibility = shouldBeVisible ? "visible" : "hidden";
      }
      
      if (visibility === "visible") {
        visibleColumns.push(column);
      } else {
        hiddenColumns.push(column);
      }
    });

    systemColumns.push(...systemCols);

    return {
      visibleColumns,
      hiddenColumns,
      systemColumns,
      hasCollapsibleContent: hiddenColumns.length > 0
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
    const { visibleColumns, hiddenColumns, systemColumns } = 
      this.categorizeByMobileBehavior(allColumns);

    if (!isCollapseMode) {
      return {
        visibleColumns: [...systemColumns, ...visibleColumns, ...hiddenColumns],
        hiddenColumns: []
      };
    }

    return {
      visibleColumns: [...systemColumns, ...visibleColumns],
      hiddenColumns: hiddenColumns
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
   * 컬럼이 모바일에서 보여져야 하는지 자동 판단 (순수한 메타데이터 기반)
   */
  private static shouldColumnBeVisibleOnMobile(column: any, index: number): boolean {
    const meta = column.columnDef?.meta;
    
    // 1. 명시적 mobileVisibility 설정이 있으면 그것을 사용
    if (meta?.mobileVisibility === "visible") {
      return true;
    }
    if (meta?.mobileVisibility === "hidden") {
      return false;
    }
    
    // 기본값: hidden (개발자가 mobileVisibility를 명시적으로 설정해야 함)
    // 라이브러리의 일관성을 위해 자동 추론 로직을 제거하고 명시적 설정을 권장
    return false;
  }
}