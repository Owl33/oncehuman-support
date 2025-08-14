// components/ui/data-table/table-layout/renderers/CellTypes.ts
import { CELL_RENDERER_TYPES } from "../../shared/constants";
import type { CellRendererType } from "../../shared/types";

/**
 * 셀 렌더링 타입별 설정
 */
export const CELL_CONFIGS = {
  [CELL_RENDERER_TYPES.TEXT]: {
    inputType: "text",
    multiline: false,
    hasOptions: false,
  },
  [CELL_RENDERER_TYPES.NUMBER]: {
    inputType: "number",
    multiline: false,
    hasOptions: false,
  },
  [CELL_RENDERER_TYPES.TEXTAREA]: {
    inputType: "text",
    multiline: true,
    hasOptions: false,
    minHeight: "80px",
  },
  [CELL_RENDERER_TYPES.SELECT]: {
    inputType: "select",
    multiline: false,
    hasOptions: true,
    requiresOptions: true,
  },
  [CELL_RENDERER_TYPES.READONLY]: {
    inputType: "readonly",
    multiline: false,
    hasOptions: false,
    editable: false,
  },
} as const;

/**
 * 셀 타입 유효성 검증
 */
export function validateCellType(
  type: CellRendererType,
  meta?: any
): { isValid: boolean; message?: string } {
  const config = CELL_CONFIGS[type];
  
  if (!config) {
    return { isValid: false, message: `Unknown cell type: ${type}` };
  }

  if ('requiresOptions' in config && config.requiresOptions && (!meta?.editOptions || meta.editOptions.length === 0)) {
    return { isValid: false, message: `Cell type '${type}' requires editOptions` };
  }

  return { isValid: true };
}

/**
 * 셀 타입별 기본 속성 가져오기
 */
export function getCellTypeDefaults(type: CellRendererType) {
  return CELL_CONFIGS[type] || CELL_CONFIGS[CELL_RENDERER_TYPES.TEXT];
}