"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronsUpDown,
  XIcon,
} from "lucide-react";
import { Brand } from "@repo/shared-types";
import { TablePagination } from "@/components/widgets/table-pagination";

interface Props {
  columns: ColumnDef<Brand>[];
  data: Brand[];
  totalPages: number;
  page: number;
  total: number;
  isLoading: boolean;
  limit?: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function BrandTable({
  columns,
  data,
  totalPages,
  page,
  total,
  isLoading,
  limit,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const pageSize = limit ?? PAGE_SIZE_OPTIONS[0];

  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";
  const status =
    (searchParams.get("status") as "active" | "inactive" | "all") || "all";
  const [sortColumn, sortDirection] = sort.includes("_")
    ? (sort.split("_") as [string, "asc" | "desc"])
    : [undefined, undefined];

  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const table = useReactTable({
    data,
    columns,
    state: {},
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  useEffect(() => {
    if (debouncedSearch === q) return; // prevent double update

    const params = new URLSearchParams(searchParams);
    params.set("q", debouncedSearch);
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const value = inputRef.current.value;
      inputRef.current.setSelectionRange(value.length, value.length);
    }
  }, [q]);

  const sortableColumns = new Set(["name", "status", "createdAt"]);

  const buildSortKey = (columnId: string, direction: "asc" | "desc") => {
    switch (columnId) {
      case "name":
        return `name_${direction}`;
      case "status":
        return `status_${direction}`;
      case "createdAt":
        return `createdAt_${direction}`;
      default:
        return "";
    }
  };

  const handleSort = (columnId: string) => {
    if (!sortableColumns.has(columnId)) return;

    const isSameColumn = sortColumn === columnId;
    const nextDirection: "asc" | "desc" =
      isSameColumn && sortDirection === "asc" ? "desc" : "asc";
    const sortKey = buildSortKey(columnId, nextDirection);

    if (!sortKey) return;

    const params = new URLSearchParams(searchParams);
    params.set("sort", sortKey);
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderSortIcon = (columnId: string) => {
    if (!sortableColumns.has(columnId)) return null;

    if (sortColumn !== columnId) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
    );
  };

  const handleStatusChange = (nextStatus: "active" | "inactive" | "all") => {
    if (status === nextStatus) return;

    const params = new URLSearchParams(searchParams);
    params.set("status", nextStatus);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 📄 Pagination handler
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLimitChange = (nextLimit: number) => {
    if (!Number.isFinite(nextLimit) || nextLimit === pageSize) return;

    const params = new URLSearchParams(searchParams);
    params.set("limit", String(nextLimit));
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* 🔍 Search + Columns */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Input
            placeholder="Search categories..."
            type="search"
            className="max-w-xs"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            ref={inputRef}
          />
          {searchInput && (
            <XIcon
              className="size-4 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSearchInput("");
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Status: <span className="capitalize">{status}</span>
                <ChevronsUpDown className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={status === "all"}
                onCheckedChange={() => handleStatusChange("all")}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={status === "active"}
                onCheckedChange={() => handleStatusChange("active")}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={status === "inactive"}
                onCheckedChange={() => handleStatusChange("inactive")}
              >
                Inactive
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns
                <ChevronsUpDown className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {table.getAllLeafColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  className="capitalize"
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 🧱 Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const isSortable = sortableColumns.has(columnId);

                  return (
                    <TableHead
                      key={header.id}
                      onClick={() => (isSortable ? handleSort(columnId) : null)}
                      className={
                        isSortable ? "cursor-pointer select-none" : undefined
                      }
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {renderSortIcon(columnId)}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-6 text-center"
                >
                  No brands found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={goToPage}
        onPageSizeChange={handleLimitChange}
      />
    </div>
  );
}
