"use client";

import { Brand } from "@repo/shared-types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const BrandColumns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Brand Name",
  },

  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <code>/{row.original.slug}</code>,
  },

  // {
  //   accessorKey: "logoUrl",
  //   header: "Logo",
  //   cell: ({ row }) => {
  //     const url = row.original.logoUrl;
  //     if (!url) return "—";
  //     return (
  //       <img
  //         src={url}
  //         className="h-8 w-8 object-contain"
  //       />
  //     );
  //   },
  // },

  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => format(new Date(row.original.createdAt), "PP"),
  },
];
