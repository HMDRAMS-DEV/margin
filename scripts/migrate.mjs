import { readFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const migration = await readFile(
  path.join(process.cwd(), "db", "001_initial.sql"),
  "utf8",
);
const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  prepare: false,
  ssl: "require",
});

await sql.unsafe(migration);
await sql.end();
console.log("Applied db/001_initial.sql");
