"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

export function useClientPagination<T>(items: T[], initialPageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    setCurrentPage,
    setPageSize,
  };
}

type TablePaginationFooterProps = {
  count: number;
  itemLabel: string;
  activeFiltersLabel?: string | null;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function TablePaginationFooter({
  count,
  itemLabel,
  activeFiltersLabel,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: TablePaginationFooterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-secondary px-4 py-3 gap-4 text-xs text-muted-foreground bg-popover/50">
      <div className="flex items-center gap-3">
        <span>
          {count} {itemLabel}
          {count !== 1 ? "s" : ""}
        </span>
        {activeFiltersLabel ? <span>• {activeFiltersLabel}</span> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <span>Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-17.5 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || count === 0}
            >
              <span className="sr-only">Previous page</span>
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || count === 0}
            >
              <span className="sr-only">Next page</span>
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
