import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3336;

const server = app.listen(port, () => {
  console.log(`Listening at http://${host}:${port}/api/product/health`);
  console.log(`Swagger UI available at http://${host}:${port}/api/product/api-docs`);
});

server.on("error", console.error);
