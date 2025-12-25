import React, { Suspense } from "react";
import BrandSection from "./_components/brand-section";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const BrandsPage = async ({ searchParams }: Props) => {
  // console.log("params: ", params);
  const query = (await searchParams);
  console.log("query: ", query);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrandSection query={query} />
    </Suspense>
  );
};

export default BrandsPage;
