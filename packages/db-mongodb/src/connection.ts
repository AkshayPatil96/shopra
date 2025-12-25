import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;

  await mongoose.connect(MONGO_URI);
  isConnected = true;
}
