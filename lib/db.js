import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

export const hasDatabase = Boolean(uri);

const cached = globalThis.__mongo ?? (globalThis.__mongo = { client: uri ? new MongoClient(uri) : null, promise: null });

export const client = cached.client;

export const db = client?.db() ?? null;

export const connectDB = () => {
  if (!client) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  cached.promise ??= client.connect().then(() => {
    if (mongoose.connection.readyState === 0) mongoose.connection.setClient(client);
    return mongoose;
  });
  return cached.promise;
};
