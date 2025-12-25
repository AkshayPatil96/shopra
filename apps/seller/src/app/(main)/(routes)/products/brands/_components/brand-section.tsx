"use client";

import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/widgets/section-heeader";
import { useGetBrands } from "@/lib/api/brands";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import { BrandTable } from "./brand-table";
import { BrandColumns } from "./columns";
import AddBrandForm from "./add-brand-form";

type Props = { [key: string]: string | string[] | undefined };

const BrandSection = ({ query }: { query: Props }) => {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";
  const limit = Number(searchParams.get("limit")) || 10;

  const { data, isLoading } = useGetBrands({ page, q, sort, limit }) as any;

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Brands"
          subtitle="Manage your product brands"
        />

        <AddBrandForm />
      </div>

      <BrandTable
        columns={BrandColumns}
        data={data?.data || []}
        total={data?.total || 0}
        totalPages={data?.totalPages || 1}
        page={page}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BrandSection;
