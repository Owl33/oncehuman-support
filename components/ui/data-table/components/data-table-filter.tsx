// components/ui/data-table/components/data-table-filter.tsx
"use client";
import { Input } from "@/components/base/input";
import { Filter, X, Settings2, Search, Eye, EyeClosed, SearchCheck, SearchX } from "lucide-react";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/base/popover";
import { Switch } from "@/components/base/switch";
import { Label } from "@/components/base/label";
import { Separator } from "@/components/base/separator";
import { Checkbox } from "@/components/base/checkbox";
import { useDataTableContext } from "../contexts/data-table-context";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/base/toggle";
export function DataTableFilter() {
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
      activeColumns.forEach((column) => {
        const value = values[column] || "";
        table.getColumn(column)?.setFilterValue(value);
      });
      table.setGlobalFilter("");
    } else {
      table.setGlobalFilter(globalFilter);
      activeColumns.forEach((column) => {
        table.getColumn(column)?.setFilterValue("");
      });
    }
  }, [isMultipleFilter, activeColumns, values, globalFilter, table]);

  // Get filterable and hideable columns
  const filterableColumns = table.getAllColumns().filter((column) => column.getCanFilter());
  const hideableColumns = table.getAllColumns().filter((column) => column.getCanHide());

  // Check active filters
  const activeFilterCount = Object.keys(values).filter((key) => values[key]).length;
  const hiddenColumnCount = hideableColumns.filter((col) => !col.getIsVisible()).length;

  return (
    <div className="flex items-center gap-3">
      {/* Filter Settings Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 relative">
            <Settings2 className="h-4 w-4" />
            <span>필터 설정</span>
            {(activeColumns.length > 0 || hiddenColumnCount > 0) && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 px-1.5 text-xs">
                {activeColumns.length + hiddenColumnCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start">
          {/* 개별검색 */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="filter-mode"
                  className=" font-medium">
                  {isMultipleFilter ? "개별 검색" : "통합 검색"}{" "}
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  {isMultipleFilter
                    ? "검색 대상에서 개별적으로 검색합니다"
                    : "검색 대상에서 통합적으로 검색합니다"}
                </p>
              </div>
              <Switch
                checked={isMultipleFilter}
                onCheckedChange={(checked) => setFilterMode(checked ? "individual" : "global")}
              />
            </div>
          </div>
          <Separator />

          {/* 검색 대상 */}
          <div className="p-4">
            <div className="mb-2">
              <h5 className="text-xs font-medium text-muted-foreground mb-1">검색 대상</h5>
              <div className="py-2 flex gap-2">
                {filterableColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center">
                    {/* <Checkbox
                      id={`search-${column.id}`}
                      checked={activeColumns.includes(column.id)}
                      onCheckedChange={(checked) => toggleFilterColumn(column.id, !!checked)}
                    />
                    <Label
                      htmlFor={`search-${column.id}`}
                      className=" font-normal cursor-pointer flex-1"></Label> */}
                    <Toggle
                      className="data-[state=on]:bg-green-50"
                      defaultPressed={activeColumns.includes(column.id)}
                      onPressedChange={(checked) => toggleFilterColumn(column.id, !!checked)}>
                      {activeColumns.includes(column.id) ? (
                        <SearchCheck></SearchCheck>
                      ) : (
                        <SearchX></SearchX>
                      )}
                      {getColumnDisplayName(column.id)}
                    </Toggle>
                  </div>
                ))}
              </div>
            </div>
            {/* 표시컬럼 */}
            <div className="mt-2">
              <h5 className="text-xs font-medium text-muted-foreground">표시 컬럼</h5>
              <div className="py-2 flex gap-2">
                {hideableColumns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center">
                    <Toggle
                      className="data-[state=on]:bg-green-50"
                      defaultPressed={column.getIsVisible()}
                      onPressedChange={(checked) => column.toggleVisibility(!!checked)}>
                      {column.getIsVisible() ? <Eye></Eye> : <EyeClosed></EyeClosed>}
                      {getColumnDisplayName(column.id)}
                    </Toggle>
                    {/* <Checkbox
                      id={`display-${column.id}`}
                      checked={column.getIsVisible()}
                      onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
                    />
                    <Label
                      htmlFor={`display-${column.id}`}
                      className=" font-normal cursor-pointer flex-1">
                      {getColumnDisplayName(column.id)}
                    </Label> */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Search Inputs */}
      {isMultipleFilter ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeColumns.map((column) => (
            <div
              key={column}
              className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={getColumnDisplayName(column)}
                value={values[column] || ""}
                onChange={(e) => updateIndividualFilter(column, e.target.value)}
                className={cn("pl-9 pr-9 h-9 w-[180px]", values[column] && "pr-9")}
              />
              {values[column] && (
                <button
                  onClick={() => clearIndividualFilter(column)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  type="button">
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="relative group flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeColumns.length > 0
                ? `${activeColumns.map(getColumnDisplayName).join(", ")}에서 검색...`
                : "검색할 컬럼을 선택하세요"
            }
            value={globalFilter}
            onChange={(e) => updateGlobalFilter(e.target.value)}
            className={cn("pl-9 h-9", globalFilter && "pr-9")}
            disabled={activeColumns.length === 0}
          />
          {globalFilter && (
            <button
              onClick={clearGlobalFilter}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              type="button">
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      )}

      {/* Clear Filters Button */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="gap-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
          초기화
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-xs">
            {activeFilterCount}
          </Badge>
        </Button>
      )}
    </div>
  );
}
