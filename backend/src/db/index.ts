import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlitePath = process.env.DATABASE_URL ?? "data/sqlite.db";
const sqliteDir = path.dirname(sqlitePath);

if (sqliteDir && sqliteDir !== "." && !fs.existsSync(sqliteDir)) {
  fs.mkdirSync(sqliteDir, { recursive: true });
}
const sqlite = new Database(sqlitePath);

sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
export { sqlite };
