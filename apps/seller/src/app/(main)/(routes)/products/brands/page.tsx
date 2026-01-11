import React, { Suspense } from "react";
import BrandSection from "./_components/brand-section";

const BrandsPage = async () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrandSection />
    </Suspense>
  );
};

export default BrandsPage;
