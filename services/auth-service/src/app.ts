import express, { type Application, Request, Response } from "express";
import cors from "cors";
import { requestIdMiddleware, errorMiddleware } from "@repo/shared-middleware";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json" with { type: "json" };
import { userAuthRoutes } from "./modules/user-auth/index.js";
import { sellerAuthRoutes } from "./modules/seller-auth/index.js";
import dotenv from "dotenv";
dotenv.config();

const app: Application = express();

app.use(cors({
  origin: ["http://localhost:8000", "http://localhost:8001"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const serviceName = process.env.SERVICE_NAME || "auth-service";

app.use(requestIdMiddleware(serviceName));

app.get("/health", (req: Request, res: Response) => {
  res.send({ message: `Welcome to ${serviceName}!`, requestId: req.requestId });
});

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (_req: Request, res: Response) => {
  res.json(swaggerDocument);
});

app.use("/user", userAuthRoutes);
app.use("/seller", sellerAuthRoutes);

app.use(errorMiddleware(serviceName));

export default app;
