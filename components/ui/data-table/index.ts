// components/ui/data-table/index.ts
export { DataTable } from "./data-table";
export type { DataTableRef } from "./data-table";

// Optional: Export commonly used utilities
export { createSelectionColumn } from "./utils/selection-column";
export { SYSTEM_COLUMN_IDS, DEFAULT_PAGE_SIZE_OPTIONS } from "./constants";

// Optional: Export column utilities for external use
export { analyzeColumn, categorizeColumns } from "./utils/column-utils";
export type { ColumnAnalysis } from "./utils/column-utils";
