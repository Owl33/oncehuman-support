// components/ui/data-table/components/data-table-filter.tsx
"use client";
import { Input } from "@/components/base/input";
import { Filter, X, Settings2 } from "lucide-react";
import { Button } from "@/components/base/button";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Switch } from "@/components/base/switch";
import { useDataTableContext } from "../context/data-table-context";
import { useEffect } from "react";

export const DataTableFilter = () => {
  const {
    table,
    filterState,
    updateIndividualFilter,
    clearIndividualFilter,
    updateGlobalFilter,
    clearGlobalFilter,
    clearAllFilters,
    toggleFilterColumn,
    setFilterMode,
    getColumnDisplayName,
  } = useDataTableContext();

  if (!table) return null;

  const { activeColumns, mode, values } = filterState;
  const isMultipleFilter = mode === "individual";
  const globalFilter = values.global || "";

  // Apply filters based on mode
  useEffect(() => {
    if (isMultipleFilter) {
      // Apply individual column filters
      activeColumns.forEach((column) => {
        const value = values[column] || "";
        table.getColumn(column)?.setFilterValue(value);
      });
      // Clear global filter
      table.setGlobalFilter("");
    } else {
      // Apply global filter
      table.setGlobalFilter(globalFilter);
      // Clear individual filters
      activeColumns.forEach((column) => {
        table.getColumn(column)?.setFilterValue("");
      });
    }
  }, [isMultipleFilter, activeColumns, values, globalFilter, table]);

  // Create dropdown items
  const filterableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanFilter())
    .map((column) => ({
      type: "checkbox" as const,
      value: `🔍 ${getColumnDisplayName(column.id)}`,
      id: column.id,
      checked: activeColumns.includes(column.id),
      onCheckedChange: (value: boolean) => toggleFilterColumn(column.id, value),
    }));

  const columnToggleItems = table
    .getAllColumns()
    .filter((column) => column.getCanHide())
    .map((column) => ({
      type: "checkbox" as const,
      value: `👁️ ${getColumnDisplayName(column.id)}`,
      checked: column.getIsVisible(),
      onCheckedChange: (value: boolean) => column.toggleVisibility(!!value),
    }));

  const allDropdownItems: DropdownItem[] = [
    {
      type: "item",
      value: (
        <>
          <span>다중 필터</span>
          <Switch
            checked={isMultipleFilter}
            onCheckedChange={(checked) => setFilterMode(checked ? "individual" : "global")}
          />
        </>
      ),
    },
    ...filterableColumns,
    { type: "separator" },
    ...columnToggleItems,
  ];

  // Check active filters
  const hasActiveFilters = Object.keys(values).some((key) => values[key]);

  // Button text
  const getButtonText = () => {
    const visibleCount = table.getAllColumns().filter((col) => col.getIsVisible()).length;
    return `검색: ${activeColumns.length}개 | 표시: ${visibleCount}개`;
  };

  return (
    <div className="flex items-center gap-4">
      <Dropdown
        trigger={
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            <Settings2 className="h-4 w-4" />
            {getButtonText()}
          </Button>
        }
        items={allDropdownItems}
      />

      {isMultipleFilter ? (
        <div className="flex flex-wrap gap-2">
          {activeColumns.map((column) => (
            <div
              key={column}
              className="relative">
              <Input
                placeholder={`Filter ${getColumnDisplayName(column)}...`}
                value={values[column] || ""}
                onChange={(e) => updateIndividualFilter(column, e.target.value)}
                className="max-w-sm pr-8"
              />
              {values[column] && (
                <button
                  onClick={() => clearIndividualFilter(column)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="relative max-w-sm">
          <Input
            placeholder={`Search in ${activeColumns.map(getColumnDisplayName).join(", ")}...`}
            value={globalFilter}
            onChange={(e) => updateGlobalFilter(e.target.value)}
            className="pr-8"
          />
          {globalFilter && (
            <button
              onClick={clearGlobalFilter}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              type="button">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
};
