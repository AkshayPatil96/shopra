"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/widgets/section-heeader";
import { useGetBrandById, useGetBrands } from "@/lib/api/brands";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Brand } from "@repo/shared-types";
import { BrandTable } from "./brand-table";
import { getBrandColumns } from "./columns";
import BrandFormModal from "./brand-form-modal";

const BrandSection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "";
  const limit = Number(searchParams.get("limit")) || 10;
  const status =
    (searchParams.get("status") as "active" | "inactive" | "all") || "all";

  const { data, isLoading } = useGetBrands({
    page,
    q,
    sort,
    limit,
    status,
  }) as any;

  const modalType = searchParams.get("modal") as "add" | "edit" | null;
  const modalBrandId = searchParams.get("brandId");

  const [activeBrand, setActiveBrand] = useState<Brand | undefined>(undefined);

  const openModal = useCallback(
    (type: "add" | "edit", brandId?: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("modal", type);
      if (brandId) {
        params.set("brandId", brandId);
      } else {
        params.delete("brandId");
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("modal");
    params.delete("brandId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const brands: Brand[] = data?.data || [];
  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === modalBrandId),
    [brands, modalBrandId],
  );

  const shouldFetchBrand =
    modalType === "edit" && Boolean(modalBrandId) && !selectedBrand;

  const { data: fetchedBrandResponse, isLoading: isFetchingBrand } =
    useGetBrandById(modalBrandId, {
      enabled: shouldFetchBrand,
    });

  useEffect(() => {
    if (modalType !== "edit") {
      setActiveBrand(undefined);
      return;
    }

    if (selectedBrand) {
      setActiveBrand(selectedBrand);
    }
  }, [modalType, selectedBrand]);

  useEffect(() => {
    if (modalType !== "edit") return;

    const fetchedBrand = (fetchedBrandResponse ?? fetchedBrandResponse) as
      | Brand
      | undefined;
    if (fetchedBrand) {
      setActiveBrand(fetchedBrand);
    }
  }, [modalType, fetchedBrandResponse]);

  const handleAddBrand = useCallback(() => {
    setActiveBrand(undefined);
    openModal("add");
  }, [openModal]);

  const columns = useMemo(() => getBrandColumns(), []);

  const isModalOpen = modalType === "add" || modalType === "edit";

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader
          title="Brands"
          subtitle="Manage your product brands"
        />

        <div className="flex items-center gap-2">
          <Button onClick={handleAddBrand}>
            <PlusIcon />
            Add Brand
          </Button>
        </div>
      </div>

      <BrandTable
        columns={columns}
        data={brands}
        total={data?.total || 0}
        totalPages={data?.totalPages || 1}
        page={page}
        limit={limit}
        isLoading={isLoading}
      />

      <BrandFormModal
        mode={modalType}
        brand={modalType === "edit" ? activeBrand : undefined}
        isOpen={isModalOpen}
        isLoading={modalType === "edit" && isFetchingBrand && !activeBrand}
        onClose={closeModal}
      />
    </div>
  );
};

export default BrandSection;
