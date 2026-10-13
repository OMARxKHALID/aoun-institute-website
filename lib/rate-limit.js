import "server-only";
import { headers } from "next/headers";
import { RateLimiterMongo } from "rate-limiter-flexible";
import { client, db } from "@/lib/db";

const limiter = (keyPrefix, points, duration) =>
  new RateLimiterMongo({ storeClient: client, dbName: db.databaseName, tableName: "rateLimits", keyPrefix, points, duration });

const limiters = {
  contact: limiter("contact", 3, 600),
  verify: limiter("verify", 20, 60),
  upload: limiter("upload", 20, 600),
  quiz: limiter("quiz", 30, 60),
};

export const clientIp = async () => {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
};

export const rateLimit = async (name, key) => {
  const id = key ?? (await clientIp());
  return limiters[name]
    .consume(id)
    .then(() => true)
    .catch((res) => {
      if (res instanceof Error) throw res;
      return false;
    });
};
