import { mkdirSync } from "node:fs";
import { MongoMemoryReplSet } from "mongodb-memory-server";

const dbPath = new URL("../.mongo-data", import.meta.url).pathname;
mkdirSync(dbPath, { recursive: true });

const replSet = await MongoMemoryReplSet.create({
  replSet: { name: "rs0", count: 1, storageEngine: "wiredTiger" },
  instanceOpts: [{ port: 27018, dbPath }],
});

console.log(`MongoDB dev replica set ready: ${replSet.getUri("aoun-institute")}`);

const handleStop = async () => {
  await replSet.stop({ doCleanup: false });
  process.exit(0);
};

process.on("SIGINT", handleStop);
process.on("SIGTERM", handleStop);
