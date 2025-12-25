import ProductForm from "@/app/(main)/_components/product-form";
import SectionHeader from "@/components/widgets/section-heeader";
import React from "react";
import SellerCreateProductPage from "./_components/add-product";

const ProductAddPage = () => {
  return (
    <div>
      <SectionHeader
        title="Add New Product"
        subtitle="Create a product, define variants (size, color, etc.) and manage inventory."
      />

      {/* <SellerCreateProductPage /> */}
      <ProductForm />
    </div>
  );
};

export default ProductAddPage;
