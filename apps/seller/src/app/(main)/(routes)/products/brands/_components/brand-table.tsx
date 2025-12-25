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
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { XIcon } from "lucide-react";
import { Brand } from "@repo/shared-types";

interface Props {
  columns: ColumnDef<Brand>[];
  data: Brand[];
  totalPages: number;
  page: number;
  total: number;
  isLoading: boolean;
}

export function BrandTable({
  columns,
  data,
  totalPages,
  page,
  total,
  isLoading,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";

  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 500);

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

    // router.push(`${pathname}?${params.toString()}`);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch]);

  // 🔽 Sort handler (name, createdAt)
  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams);

    const sortKey =
      columnId === "name"
        ? `name_${direction}`
        : columnId === "createdAt"
        ? `createdAt_${direction}`
        : "";

    if (sortKey) params.set("sort", sortKey);

    router.push(`${pathname}?${params.toString()}`);
  };

  // 📄 Pagination handler
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
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

      {/* 🧱 Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const sorted = sort.includes(columnId);

                  return (
                    <TableHead
                      key={header.id}
                      onClick={() =>
                        header.column.getCanSort()
                          ? handleSort(
                              columnId,
                              sorted && sort.endsWith("asc") ? "desc" : "asc",
                            )
                          : null
                      }
                      className="cursor-pointer select-none"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
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

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Prev
          </Button>

          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
