"use client";

import { CategoryTable } from "@/app/(main)/(routes)/products/categories/_components/category-table";
import { columns } from "@/app/(main)/(routes)/products/categories/_components/columns";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/widgets/section-heeader";
import { useGetCategories } from "@/lib/api/categories";
import { Category } from "@repo/shared-types";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

const CategorySection = () => {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";
  const limit = Number(searchParams.get("limit")) || 10;

  const { data, isLoading } = useGetCategories({ page, q, sort, limit }) as any;

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Categories"
          subtitle="Manage your product categories"
        />

        <Link href="/products/categories/add">
          <Button className="flex items-center">
            <PlusIcon />
            Add New Category
          </Button>
        </Link>
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
