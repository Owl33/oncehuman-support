/**
 * Column Priority System for Responsive Table
 * Defines which columns are essential (primary) vs expandable (secondary)
 */

export type ColumnPriority = 'primary' | 'secondary' | 'system';

export interface ColumnPriorityConfig {
  id: string;
  priority: ColumnPriority;
  mobileOrder?: number; // Order in mobile collapsed view
  collapsedWidth?: string; // Width in collapsed mode
}

/**
 * Analyzes columns and categorizes them by priority
 */
export function categorizeColumnsByPriority<TData>(
  columns: any[]
): {
  primaryColumns: any[];
  secondaryColumns: any[];
  systemColumns: any[];
  hasCollapsibleContent: boolean;
} {
  const primaryColumns: any[] = [];
  const secondaryColumns: any[] = [];
  const systemColumns: any[] = [];

  columns.forEach(column => {
    const priority = column.columnDef?.meta?.priority || 'secondary';
    const isSystemColumn = ['select', 'actions', 'custom-actions'].includes(column.id);

    if (isSystemColumn) {
      systemColumns.push(column);
    } else if (priority === 'primary') {
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
 * Determines if table should use collapse mode based on screen size and content
 */
export function shouldUseCollapseMode(
  screenWidth: number,
  hasCollapsibleContent: boolean
): boolean {
  // Use collapse mode on tablet/mobile when there's secondary content
  return screenWidth < 1024 && hasCollapsibleContent;
}

/**
 * Gets the appropriate column configuration for current mode
 */
export function getResponsiveColumnConfig<TData>(
  allColumns: any[],
  isCollapseMode: boolean
): {
  visibleColumns: any[];
  hiddenColumns: any[];
} {
  const { primaryColumns, secondaryColumns, systemColumns } = 
    categorizeColumnsByPriority(allColumns);

  if (!isCollapseMode) {
    // Desktop mode: show all columns
    return {
      visibleColumns: [...systemColumns, ...primaryColumns, ...secondaryColumns],
      hiddenColumns: []
    };
  }

  // Mobile/tablet collapse mode: show system + primary columns
  // Expand button is handled directly in CollapsibleTableRow component
  return {
    visibleColumns: [...systemColumns, ...primaryColumns],
    hiddenColumns: secondaryColumns
  };
}


/**
 * Default priority configurations for common use cases
 */
export const defaultPriorityConfigs = {
  character: [
    { id: 'name', priority: 'primary' as ColumnPriority, mobileOrder: 1 },
    { id: 'server', priority: 'primary' as ColumnPriority, mobileOrder: 2 },
    { id: 'scenario', priority: 'secondary' as ColumnPriority },
    { id: 'job', priority: 'secondary' as ColumnPriority },
    { id: 'desc', priority: 'secondary' as ColumnPriority },
  ]
};