// components/ui/data-table/index.ts - New Vue-style modular structure
export { DataTable } from "./core";
export type { DataTableRef } from "./core";

// Export commonly used utilities for external use
export { createSelectionColumn, createActionsColumn, createCustomActionsColumn } from "./table-columns";
export { ColumnManager } from "./table-columns";
export { CellRenderer } from "./table-layout";

// Export constants and types for customization
export { 
  SYSTEM_COLUMN_IDS, 
  DEFAULT_PAGE_SIZE_OPTIONS,
  COLUMN_PRIORITIES,
  CELL_RENDERER_TYPES 
} from "./shared/constants";

export type { 
  ActionItem, 
  DataTableRef as DataTableRefType,
  ColumnPriority,
  CellRendererType,
  EditState,
  FilterState 
} from "./shared/types";

// Export hooks for advanced usage
export { useMobileDetection, useRowSwipeActions } from "./table-features/responsive";
export { useEditingState } from "./table-features/editing";
export { useFilteringState } from "./table-features/filtering";