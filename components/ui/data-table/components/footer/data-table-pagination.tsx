// components/ui/data-table/components/data-table-pagination.tsx
"use client";
import { Button } from "@/components/base/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { useDataTableContext } from "@/components/ui/data-table/contexts/data-table-context";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/components/ui/data-table/constants";
import { Badge } from "@/components/base/badge";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
}

export function DataTablePagination({
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS as unknown as number[],
  showPageSizeSelector = true,
  showPageInfo = true,
}: DataTablePaginationProps = {}) {
  const { table } = useDataTableContext();

  if (!table) return null;

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (pageCount <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Show first, last, and pages around current
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(pageCount);
      } else if (currentPage >= pageCount - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = pageCount - 4; i <= pageCount; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(pageCount);
      }
    }

    return pages;
  };

  return (
    <div className="flex   items-center gap-4 sm:gap-6">
      {/* Page info */}
      {showPageInfo && (
        <div className=" text-muted-foreground ">
          <span className="font-medium text-foreground">
            {table.getFilteredSelectedRowModel().rows.length}
          </span>
          {" / "}
          <span className="font-medium text-foreground">
            {table.getFilteredRowModel().rows.length}
          </span>
          {" 개 선택"}
        </div>
      )}

      {/* Center controls */}
      <div className="flex items-center gap-4 flex-1 justify-center">
        {/* Page size selector */}

        {/* Page navigation */}
        <div className="flex items-center">
          {/* First page */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}>
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">첫 페이지</span>
          </Button>

          {/* Previous page */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">이전 페이지</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <div
                    key={`ellipsis-${index}`}
                    className="flex items-center justify-center w-9 h-9">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                );
              }

              const pageNumber = page as number;
              const isActive = pageNumber === currentPage;

              return (
                <Button
                  key={pageNumber}
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  className={cn("h-9 w-9", isActive && "pointer-events-none")}
                  onClick={() => table.setPageIndex(pageNumber - 1)}>
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          {/* Next page */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">다음 페이지</span>
          </Button>

          {/* Last page */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}>
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">마지막 페이지</span>
          </Button>
        </div>
      </div>
      {showPageSizeSelector && (
        <div className="flex items-center gap-2">
          <span className=" text-muted-foreground hidden sm:inline">페이지당</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}>
            <SelectTrigger className="h-9 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className=" text-muted-foreground hidden sm:inline">개</span>
        </div>
      )}
      {/* Total pages badge */}
      <div className=" hidden lg:block">
        <Badge
          variant="secondary"
          className="font-mono">
          {currentPage} / {pageCount}
        </Badge>
      </div>
    </div>
  );
}
