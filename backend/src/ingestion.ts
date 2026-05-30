import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  assignmentProgress,
  documentTopics,
  documents,
  topics,
} from "./db/schema";
import { getEmbedding } from "./embedding";
import { vectorDb } from "./vector";

const anthropic = new Anthropic();

export type IngestionResult = {
  title: string;
  category: "note" | "resource" | "assignment";
  content: string;
  topics: string[];
  topicDisplayNames: Record<string, string>;
};

export async function archiveFile(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  const hash = crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex")
    .slice(0, 12);
  const ext = path.extname(originalName);
  const archiveRelative = path.join("archive", `${hash}${ext}`);
  const archivePath = path.join(process.cwd(), archiveRelative);

  await fs.mkdir(path.dirname(archivePath), { recursive: true });
  await fs.writeFile(archivePath, buffer);

  return archiveRelative;
}

export async function extractText(
  buffer: Buffer,
  mimetype: string,
): Promise<string> {
  switch (mimetype) {
    case "text/plain":
    case "text/markdown":
      return buffer.toString("utf-8");
    case "application/pdf": {
      const pdf = await import("pdf-parse");
      const data = await pdf.default(buffer);
      return data.text;
    }
    case "image/png":
    case "image/jpeg":
      return "__IMAGE__";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    default:
      throw new Error(`Unsupported mimetype: ${mimetype}`);
  }
}

export async function runIngestionModel(
  rawText: string,
  course: { name: string; description: string | null },
  existingTopics: { id: string; displayName: string }[],
  imageBuffer?: Buffer,
  imageMimetype?: string,
): Promise<IngestionResult> {
  const existingTopicList = existingTopics
    .map((topic) => `- ${topic.id} ("${topic.displayName}")`)
    .join("\n");

  const systemPrompt = `
You are a document processor for a student knowledge base.

You will receive a document and must return a single JSON object — no prose, no markdown fences, just raw JSON.

The JSON must have exactly these fields:
- title: string — a clear, descriptive title for the document
- category: "note" | "resource" | "assignment"
- content: string — the document rewritten as clean, readable plain text. Preserve all meaningful information. Remove noise, formatting artifacts, and redundancy. Do not include a title or any metadata in the content.
- topics: string[] — flat list of topic slugs this document covers. Use existing slugs where they fit. Create new slugs (lowercase, hyphenated) only when no existing slug applies.
- topicDisplayNames: object — only include entries for NEW slugs you created. Map slug to a short human-readable label.

Categorisation rules:
- "note" — lecture notes, personal notes, summaries written by the student
- "resource" — textbooks, papers, reference material, slides
- "assignment" — problem sets, coursework, tasks the student must complete

Existing topics for this course:
${existingTopicList || "None yet."}

Course context:
Name: ${course.name}
Description: ${course.description || "None provided."}
`.trim();

  const userContent: MessageParam["content"] = [];

  if (imageBuffer && imageMimetype) {
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMimetype as "image/png" | "image/jpeg",
        data: imageBuffer.toString("base64"),
      },
    });
    userContent.push({ type: "text", text: "Process this image as a document." });
  } else {
    userContent.push({ type: "text", text: rawText });
  }

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  const raw = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  try {
    const parsed = JSON.parse(raw) as IngestionResult;
    return {
      ...parsed,
      topicDisplayNames: parsed.topicDisplayNames ?? {},
    };
  } catch (err) {
    throw new Error(`Claude returned invalid JSON: ${String(err)}`);
  }
}

export async function writeToRepository(
  content: string,
  ext = ".md",
): Promise<string> {
  const id = crypto.randomBytes(6).toString("hex");
  const repositoryRelative = path.join("repository", `${id}${ext}`);
  const repositoryPath = path.join(process.cwd(), repositoryRelative);

  await fs.mkdir(path.dirname(repositoryPath), { recursive: true });
  await fs.writeFile(repositoryPath, content, "utf-8");

  return repositoryRelative;
}

export async function commitToDatabase(
  filePath: string,
  archivePath: string,
  courseId: string,
  result: IngestionResult,
) {
  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    for (const slug of result.topics) {
      await tx
        .insert(topics)
        .values({
          id: slug,
          courseId,
          displayName: result.topicDisplayNames[slug] ?? slug,
          createdAt: now,
        })
        .onConflictDoNothing();
    }

    await tx.insert(documents).values({
      filePath,
      courseId,
      title: result.title,
      category: result.category,
      sourcePath: archivePath,
      createdAt: now,
    });

    for (const slug of result.topics) {
      await tx
        .insert(documentTopics)
        .values({ filePath, topicId: slug })
        .onConflictDoNothing();
    }

    if (result.category === "assignment") {
      await tx.insert(assignmentProgress).values({
        id: crypto.randomUUID(),
        filePath,
        status: "pending",
        attempts: 0,
        modelNotes: null,
        lastAttemptAt: null,
      });
    }
  });
}

export async function embedAndIndex(filePath: string, content: string) {
  const chunks = chunkText(content, { size: 512, overlap: 64 });

  for (let i = 0; i < chunks.length; i += 1) {
    const embedding = await getEmbedding(chunks[i]);
    vectorDb.insert({
      filePath,
      chunkIndex: i,
      chunk: chunks[i],
      embedding,
    });
  }
}

export function chunkText(
  text: string,
  options: { size: number; overlap: number },
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    chunks.push(words.slice(i, i + options.size).join(" "));
    i += options.size - options.overlap;
  }

  return chunks;
}

export async function fetchExistingTopics(courseId: string) {
  return db.query.topics.findMany({
    where: eq(topics.courseId, courseId),
  });
}
