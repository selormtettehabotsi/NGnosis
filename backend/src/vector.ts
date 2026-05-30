import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import * as sqliteVec from "sqlite-vec";

const vectorPath = process.env.VECTOR_DB_PATH ?? "data/vector.db";
const vectorDir = path.dirname(vectorPath);

if (vectorDir && vectorDir !== "." && !fs.existsSync(vectorDir)) {
  fs.mkdirSync(vectorDir, { recursive: true });
}

const db = new Database(vectorPath);
sqliteVec.load(db);

db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS document_chunks USING vec0(
    file_path TEXT,
    chunk_index INTEGER,
    chunk TEXT,
    embedding FLOAT[1536]
  )
`);

export const vectorDb = {
  insert: (row: {
    filePath: string;
    chunkIndex: number;
    chunk: string;
    embedding: number[];
  }) => {
    db.prepare(
      `
        INSERT INTO document_chunks (file_path, chunk_index, chunk, embedding)
        VALUES (?, ?, ?, ?)
      `,
    ).run(
      row.filePath,
      row.chunkIndex,
      row.chunk,
      JSON.stringify(row.embedding),
    );
  },
  search: (embedding: number[], limit: number) => {
    const stmt = db.prepare(
      `
        SELECT
          file_path as filePath,
          chunk_index as chunkIndex,
          chunk,
          distance
        FROM document_chunks
        WHERE embedding MATCH ?
        ORDER BY distance
        LIMIT ?
      `,
    );
    return stmt.all(JSON.stringify(embedding), limit) as Array<{
      filePath: string;
      chunkIndex: number;
      chunk: string;
      distance: number;
    }>;
  },
};
