import express, { Request, Response } from "express";
import { requestIdMiddleware, errorMiddleware } from "@repo/shared-middleware";
import dotenv from "dotenv";
import cors from "cors";
// import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./swagger-output.json" with { type: "json" };

import categoryRoutes from "./routes/category.routes.js";
import brandRoutes from "./routes/brand.routes.js";

dotenv.config({ path: "../../.env" });
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const serviceName = process.env.SERVICE_NAME || "product-service";
app.use(requestIdMiddleware(serviceName));

app.get("/health", (req: Request, res: Response) => {
  res.send({ message: `Welcome to ${serviceName}!`, requestId: req.requestId });
});

// Swagger route
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.get("/docs-json", (_req: Request, res: Response) => {
//   res.json(swaggerDocument);
// });

app.use("/categories", categoryRoutes);
app.use("/brands", brandRoutes);

app.use(errorMiddleware(serviceName));

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3336;
const server = app.listen(port, () => {
  console.log(`Listening at http://${host}:${port}/api/product/health`);
  console.log(`Swagger UI available at http://${host}:${port}/api/product/api-docs`);
});
server.on("error", console.error);
