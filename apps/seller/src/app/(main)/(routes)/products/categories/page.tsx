import React, { Suspense } from "react";
import CategorySection from "./_components/category-section";

const CategoryPage = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategorySection />
    </Suspense>
  );
};

export default CategoryPage;
