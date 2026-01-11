"use client";

import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TablePaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  siblingCount?: number;
  className?: string;
};

type PaginationElement = number | "ellipsis";

const range = (start: number, end: number) =>
  Array.from(
    { length: Math.max(end - start + 1, 0) },
    (_, index) => start + index,
  );

const buildPaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): PaginationElement[] => {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSiblingIndex > 2;
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + siblingCount * 2;
    return [...range(1, leftItemCount), "ellipsis", totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + siblingCount * 2;
    return [
      1,
      "ellipsis",
      ...range(totalPages - rightItemCount + 1, totalPages),
    ];
  }

  return [
    1,
    "ellipsis",
    ...range(leftSiblingIndex, rightSiblingIndex),
    "ellipsis",
    totalPages,
  ];
};

export function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  siblingCount = 1,
  className,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);

  const paginationRange = useMemo(
    () => buildPaginationRange(safePage, safeTotalPages, siblingCount),
    [safePage, safeTotalPages, siblingCount],
  );

  const isPreviousDisabled = safePage <= 1 || totalPages <= 1;
  const isNextDisabled = safePage >= totalPages || totalPages <= 1;

  const hasTotals =
    typeof totalItems === "number" &&
    typeof pageSize === "number" &&
    pageSize > 0;
  const safeTotalItems = Math.max(totalItems ?? 0, 0);
  const showPageSizeSelect = Boolean(
    onPageSizeChange &&
      pageSizeOptions.length > 0 &&
      typeof pageSize === "number",
  );

  let summary = `Page ${safePage} of ${safeTotalPages}`;

  if (hasTotals) {
    if (safeTotalItems === 0) {
      summary = "No results";
    } else {
      const start = Math.min((safePage - 1) * pageSize! + 1, safeTotalItems);
      const end = Math.min(safePage * pageSize!, safeTotalItems);
      summary = `Showing ${start}-${end} of ${safeTotalItems}`;
    }
  }

  const handlePageChange = (nextPage: number) => {
    if (nextPage === safePage || nextPage < 1 || nextPage > totalPages) {
      return;
    }

    onPageChange(nextPage);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
    >
      <span className="text-sm text-muted-foreground">{summary}</span>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
        {totalPages > 1 && (
          <Pagination className="w-full sm:w-auto">
            <PaginationContent className="w-full flex-wrap justify-end gap-1 sm:flex-nowrap sm:justify-center">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className={cn(
                    isPreviousDisabled && "pointer-events-none opacity-50",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    if (!isPreviousDisabled) {
                      handlePageChange(safePage - 1);
                    }
                  }}
                />
              </PaginationItem>

              {paginationRange.map((pageNumber, index) => (
                <PaginationItem key={`${pageNumber}-${index}`}>
                  {pageNumber === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === safePage}
                      onClick={(event) => {
                        event.preventDefault();
                        handlePageChange(pageNumber as number);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  className={cn(
                    isNextDisabled && "pointer-events-none opacity-50",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    if (!isNextDisabled) {
                      handlePageChange(safePage + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {showPageSizeSelect && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows Per Page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const next = Number(value);
              if (!Number.isNaN(next) && next !== pageSize) {
                onPageSizeChange?.(next);
              }
            }}
          >
            <SelectTrigger className="w-fit">
              <SelectValue className={""}>{pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem
                  key={option}
                  value={String(option)}
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
