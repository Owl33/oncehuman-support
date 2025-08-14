// components/ui/data-table/shared/constants.ts
export const SYSTEM_COLUMN_IDS = ["select", "actions", "custom-actions"] as const;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;
export const TEMP_ROW_ID = "temp_new_row";

export const DEFAULT_FILTER_COLUMNS = ["name"];
export const EDITABLE_CELL_HEIGHT = "h-[44px]";

// Responsive breakpoints (Tailwind CSS 기준)
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

// Column priorities
export const COLUMN_PRIORITIES = {
  SYSTEM: "system",
  PRIMARY: "primary", 
  SECONDARY: "secondary",
} as const;

// Cell renderer types
export const CELL_RENDERER_TYPES = {
  TEXT: "text",
  NUMBER: "number", 
  TEXTAREA: "textarea",
  SELECT: "select",
  READONLY: "readonly",
} as const;

export type SystemColumnId = typeof SYSTEM_COLUMN_IDS[number];
export type ColumnPriority = typeof COLUMN_PRIORITIES[keyof typeof COLUMN_PRIORITIES];
export type CellRendererType = typeof CELL_RENDERER_TYPES[keyof typeof CELL_RENDERER_TYPES];