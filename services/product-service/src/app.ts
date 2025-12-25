import express, { type Application, Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config();

import { requestIdMiddleware, errorMiddleware } from "@repo/shared-middleware";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import { brandRoutes } from "./modules/brands/index.js";
import { categoryRoutes } from "./modules/categories/index.js";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8000";
const sellerFrontendUrl = process.env.SELLER_FRONTEND_URL || "http://localhost:8001";

const app: Application = express();

app.use(cors({
  origin: [frontendUrl, sellerFrontendUrl],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const serviceName = process.env.SERVICE_NAME || "product-service";
app.use(requestIdMiddleware(serviceName));

app.get("/health", (req: Request, res: Response) => {
  res.send({ message: `Welcome to ${serviceName}!`, requestId: req.requestId });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (_req: Request, res: Response) => {
  res.json(swaggerDocument);
});

app.use("/brands", brandRoutes);
app.use("/categories", categoryRoutes);

app.use(errorMiddleware(serviceName));

export default app;
