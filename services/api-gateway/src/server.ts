import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";


const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const server = app.listen(port, host, () => {
  console.log(`🚀 API Gateway running at http://${host}:${port}/health`);
});

server.on("error", console.error);
