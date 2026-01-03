"use client";

import { CategoryTable } from "@/app/(main)/(routes)/products/categories/_components/category-table";
import { columns } from "@/app/(main)/(routes)/products/categories/_components/columns";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/widgets/section-heeader";
import { useGetCategories } from "@/lib/api/categories";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const CategorySection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";
  const limit = Number(searchParams.get("limit")) || 10;
  const status = (searchParams.get("status") as "active" | "inactive" | "all") || "active";

  const { data, isLoading } = useGetCategories({ page, q, sort, limit, status }) as any;

  const handleStatusChange = (nextStatus: "active" | "inactive" | "all") => {
    if (nextStatus === status) return;

    const params = new URLSearchParams(searchParams);
    params.set("status", nextStatus);
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader
          title="Categories"
          subtitle="Manage your product categories"
        />

        <div className="flex items-center gap-2">
          {(["active", "inactive", "all"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={status === value ? "default" : "outline"}
              onClick={() => handleStatusChange(value)}
            >
              {value === "all"
                ? "All"
                : value === "active"
                ? "Active"
                : "Inactive"}
            </Button>
          ))}

          <Link href="/products/categories/add">
            <Button className="flex items-center">
              <PlusIcon />
              Add New Category
            </Button>
          </Link>
        </div>
      </div>

      <CategoryTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        totalPages={data?.totalPages || 1}
        page={page}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CategorySection;
