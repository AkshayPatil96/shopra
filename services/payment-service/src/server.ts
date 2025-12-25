import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3335;

const server = app.listen(port, () => {
  console.log(`Listening at http://${host}:${port}/api/payment/health`);
  console.log(`Swagger UI available at http://${host}:${port}/api/payment/api-docs`);
});

server.on("error", console.error);
