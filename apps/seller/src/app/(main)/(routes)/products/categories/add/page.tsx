import AddCategoryForm from "@/app/(main)/(routes)/products/categories/_components/category-form";
import SectionHeader from "@/components/widgets/section-heeader";
import React from "react";

const CategoryAddPage = () => {
  return (
    <div>
      <SectionHeader
        title="Add New Category"
        subtitle="Create a new category and optionally set a parent for nested categories."
      />

      <AddCategoryForm />
    </div>
  );
};

export default CategoryAddPage;
