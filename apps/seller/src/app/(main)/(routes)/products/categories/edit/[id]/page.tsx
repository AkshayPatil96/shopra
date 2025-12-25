"use client";

import SectionHeader from "@/components/widgets/section-heeader";
import { useGetCategory } from "@/lib/api/categories";
import { CategoryAPI } from "@repo/shared-axios";
import React, { use } from "react";
import AddCategoryForm from "../../_components/category-form";

type Props = {
  params: Promise<{ id: string }>;
};

const SingleCategoryPage = ({ params }: Props) => {
  const { id } = use(params);

  const { data, isFetching, error } = useGetCategory(id) as any;
  console.log("data: ", data);

  return isFetching ? (
    <div>Loading...</div>
  ) : data?.data ? (
    <div>
      <SectionHeader
        title="Edit Category"
        subtitle="Modify the details of your category below."
      />

      <AddCategoryForm category={data.data} id={id} />
    </div>
  ) : (
    <div>Error: {error?.message || "Category not found"}</div>
  );
};

export default SingleCategoryPage;
