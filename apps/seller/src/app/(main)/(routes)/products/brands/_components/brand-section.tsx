"use client";

import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/widgets/section-heeader";
import { useGetBrands } from "@/lib/api/brands";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { BrandTable } from "./brand-table";
import { BrandColumns } from "./columns";
import AddBrandForm from "./add-brand-form";

type Props = { [key: string]: string | string[] | undefined };

const BrandSection = ({ query }: { query: Props }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";
  const limit = Number(searchParams.get("limit")) || 10;
  const status = (searchParams.get("status") as "active" | "inactive" | "all") || "active";

  const { data, isLoading } = useGetBrands({ page, q, sort, limit, status }) as any;

  const handleStatusChange = (nextStatus: "active" | "inactive" | "all") => {
    if (status === nextStatus) return;

    const params = new URLSearchParams(searchParams);
    params.set("status", nextStatus);
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader
          title="Brands"
          subtitle="Manage your product brands"
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

          <AddBrandForm />
        </div>
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
