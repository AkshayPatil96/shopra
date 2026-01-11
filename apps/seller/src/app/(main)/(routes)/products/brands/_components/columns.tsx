"use client";

import { Brand } from "@repo/shared-types";
import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import {
  CheckIcon,
  EditIcon,
  MoreHorizontal,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

const BrandActionsCell = ({ row }: { row: Row<Brand> }) => {
  const router = useRouter();

  return (
    <>
      <Menu>
        <MenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
            />
          }
        >
          <MoreHorizontal className="h-4 w-4" />
        </MenuTrigger>
        <MenuPopup>
          <MenuItem
            onClick={(event) => {
              event.preventDefault();
              router.push(`?modal=edit&brandId=${row.original.id}`);
            }}
          >
            <EditIcon className="mr-2 h-4 w-4" />
            Edit
          </MenuItem>
          <MenuItem disabled>
            <TrashIcon className="mr-2 h-4 w-4 opacity-70" />
            Delete
          </MenuItem>
        </MenuPopup>
      </Menu>
    </>
  );
};

export const getBrandColumns = (): ColumnDef<Brand>[] => [
  {
    accessorKey: "name",
    header: "Brand Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm text-foreground">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <code className="text-sm text-muted-foreground">
        /{row.original.slug}
      </code>
    ),
  },
  {
    id: "status",
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.isActive ? "success" : "error"}
        className="flex items-center gap-1 w-fit px-1.5 py-0.5"
      >
        {row.original.isActive ? (
          <CheckIcon className="h-3 w-3" />
        ) : (
          <XIcon className="h-3 w-3" />
        )}
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.original.createdAt), "PP")}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <BrandActionsCell row={row} />,
  },
];
