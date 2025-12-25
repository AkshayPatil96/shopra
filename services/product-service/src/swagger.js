import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Auth Service API",
    description: "API documentation for the Auth Service",
    version: "1.0.0",
  },
  host: `${process.env.HOST || "localhost"}:${process.env.PORT || 3334}`,
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["../dist/routes/auth.routes.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
