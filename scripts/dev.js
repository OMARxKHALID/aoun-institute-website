import { spawn } from "node:child_process";
import { connect } from "node:net";

const uri = process.env.MONGODB_URI ?? "";
const local = uri.match(/^mongodb:\/\/(?:127\.0\.0\.1|localhost):(\d+)/);
const port = local ? Number(local[1]) : null;

const isOpen = () =>
  new Promise((resolve) => {
    const socket = connect(port, "127.0.0.1");
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });

const waitForDb = async () => {
  for (let i = 0; i < 120; i += 1) {
    if (await isOpen()) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

let db = null;
let stopping = false;

const startDb = async () => {
  db = spawn("bun", ["scripts/dev-db.js"], { stdio: "inherit" });
  db.on("exit", (code) => {
    db = null;
    if (stopping) return;
    console.warn(`[dev] local MongoDB exited (code ${code}). Restarting…`);
    setTimeout(startDb, 1000);
  });
  if (!(await waitForDb())) console.error("[dev] local MongoDB did not start within 60 s. Check the output above.");
};

if (port && !(await isOpen())) await startDb();
else if (port) console.log(`[dev] using MongoDB already running on port ${port}`);

const next = spawn("node_modules/.bin/next", ["dev", ...process.argv.slice(2)], { stdio: "inherit" });

const handleStop = () => {
  stopping = true;
  next.kill("SIGTERM");
  db?.kill("SIGTERM");
};

process.on("SIGINT", handleStop);
process.on("SIGTERM", handleStop);

next.on("exit", (code) => {
  stopping = true;
  db?.kill("SIGTERM");
  process.exit(code ?? 0);
});
