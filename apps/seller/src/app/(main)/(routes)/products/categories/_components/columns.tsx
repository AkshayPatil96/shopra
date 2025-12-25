"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  EditIcon,
  MoreHorizontal,
  PauseIcon,
  PlayIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@/components/ui/menu";
import Link from "next/link";
import { Category } from "@repo/shared-types";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      console.log("column: ", column);
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Name
          <ArrowUpDown className="h-4 w-4 ml-2" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="font-semibold p-3">{row.original.name}</span>
    ),
  },

  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => <code className="text-sm">/{row.original.slug}</code>,
  },
  {
    accessorKey: "fullSlug",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Full Slug
        <ArrowUpDown className="h-4 w-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => (
      <code className="text-sm">
        /{row.original?.fullSlug ? row.original.fullSlug : ""}
      </code>
    ),
  },

  {
    accessorKey: "parentName",
    header: "Parent",
    cell: ({ row }) =>
      row.original.parentName ? (
        <Badge>{row.original.parentName}</Badge>
      ) : (
        <span className="text-muted-foreground text-xs">NA</span>
      ),
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Created
        <ArrowUpDown className="h-4 w-4 ml-2" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt).toLocaleDateString();
      return <span className="text-sm">{date}</span>;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Menu>
          <MenuTrigger
            render={
              <Button
                variant="ghost"
                size={"icon"}
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </MenuTrigger>
          <MenuPopup
          // align="end"
          // side="bottom"
          // className={"min-w-[100px]"}
          >
            <Link href={`/products/categories/edit/${row.original.id}`}>
              <MenuItem>
                <EditIcon className="" />
                Edit
              </MenuItem>
            </Link>
            <MenuItem disabled>
              <TrashIcon className="opacity-72" />
              Delete
            </MenuItem>
          </MenuPopup>
        </Menu>
      );
    },
  },
];
