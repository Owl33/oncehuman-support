// components/ui/data-table/core/DataTablePagination.tsx
"use client";
import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/base/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { useDataTableContext } from "../table-state";
import { useMobileDetection } from "../table-features/responsive";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../shared/constants";
import { cn } from "@/lib/utils";

export function DataTablePagination() {
  const { table } = useDataTableContext();
  const { isMobile, isTablet } = useMobileDetection();

  if (!table) return null;

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;

  if (isMobile) {
    // 모바일 최적화 레이아웃
    return (
      <div className="space-y-3 px-2 py-3">
        {/* 선택된 행 정보 */}
        <div className="text-center text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length}개 중{" "}
          {table.getFilteredRowModel().rows.length}개 행이 선택됨
        </div>
        
        {/* 페이지당 행 수 선택 */}
        <div className="flex items-center justify-center space-x-2">
          <p className="text-xs font-medium">페이지당</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[60px] text-xs touch-manipulation">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {DEFAULT_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs touch-manipulation">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs font-medium">개</p>
        </div>
        
        {/* 페이지 네비게이션 */}
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 touch-manipulation"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">첫 페이지로 이동</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 touch-manipulation"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">이전 페이지로 이동</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center justify-center text-xs font-medium min-w-[80px] h-9 px-3 rounded border bg-background">
            {currentPage} / {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 touch-manipulation"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">다음 페이지로 이동</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 touch-manipulation"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">마지막 페이지로 이동</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // 데스크톱/태블릿 레이아웃
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length}개 중{" "}
        {table.getFilteredRowModel().rows.length}개 행이 선택됨
      </div>
      
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">페이지당 행 수</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {DEFAULT_PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          {currentPage} / {totalPages}페이지
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">첫 페이지로 이동</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">이전 페이지로 이동</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">다음 페이지로 이동</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">마지막 페이지로 이동</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}