// components/ui/data-table/constants.ts
export const SYSTEM_COLUMN_IDS = ["select", "actions"] as const;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;
export const TEMP_ROW_ID = "temp_new_row";

export const DEFAULT_FILTER_COLUMNS = ["name"];
export const EDITABLE_CELL_HEIGHT = "h-[44px]";

export type SystemColumnId = typeof SYSTEM_COLUMN_IDS[number];