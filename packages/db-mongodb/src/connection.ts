import mongoose from "mongoose";

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
}

let isConnected = false;

export async function connectMongo() {
  if (isConnected) {
    console.log("[mongo] already connected");
    return;
  }

  const MONGO_URI = getEnv("MONGO_URI");

  try {
    console.log("[mongo] connecting...");

    const connection = await mongoose.connect(MONGO_URI ?? "");

    isConnected = true;

    console.log("[mongo] connected");
    console.log("[mongo] host:", connection.connection.host);
    console.log("[mongo] db:", connection.connection.name);
  } catch (error) {
    console.error("[mongo] connection failed:", (error as Error).message);
    throw error;
  }
}

/* -----------------------------------------------------
   Connection Event Listeners (IMPORTANT)
----------------------------------------------------- */

mongoose.connection.on("connected", () => {
  console.log("[mongo] mongoose connected");
});

mongoose.connection.on("error", (err) => {
  console.error("[mongo] mongoose error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[mongo] mongoose disconnected");
});

/* -----------------------------------------------------
   Graceful Shutdown
----------------------------------------------------- */

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("[mongo] connection closed due to app termination");
  process.exit(0);
});
