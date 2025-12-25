import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Product Service API",
    description: "API documentation for the Product Service",
    version: "1.0.0",
  },
  host: `${process.env.HOST || "localhost"}:${process.env.PORT || 3336}`,
  basePath: "/",
  schemes: ["http"],
  definitions: {
    BrandPayload: {
      name: "Acme",
      slug: "acme",
      description: "Industrial brand",
    },
    CategoryPayload: {
      name: "Shoes",
      summary: "All footwear items",
      parentId: "parent-category-id",
    },
    SuccessResponse: {
      status: "success",
      message: "Operation completed",
    },
  },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
  "../dist/modules/brands/brand.routes.js",
  "../dist/modules/categories/category.routes.js",
];

swaggerAutogen(outputFile, endpointsFiles, doc);
