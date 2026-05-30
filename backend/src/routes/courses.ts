import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import express, { Request, Response } from "express";
import multer from "multer";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { courses, documents } from "../db/schema";
import { grepDocuments, semanticSearch } from "../context";
import {
  archiveFile,
  commitToDatabase,
  embedAndIndex,
  extractText,
  fetchExistingTopics,
  runIngestionModel,
  writeToRepository,
} from "../ingestion";
import { requireAuth } from "../auth/jwt";
import { requireVerified } from "../auth/requireVerified";

const router = express.Router();

// All course routes require authentication + verified email
router.use("/courses", requireAuth, requireVerified);
router.use("/context", requireAuth, requireVerified);
router.use("/documents", requireAuth, requireVerified);
router.use("/archive", requireAuth, requireVerified);

function routeParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Array.isArray(value) ? value[0] : value;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post("/courses", async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user!.id;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "name is required" });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(courses).values({
      id,
      userId,
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : null,
      createdAt: now,
    });

    const created = await db.query.courses.findFirst({
      where: eq(courses.id, id),
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("Failed to create course:", err);
    return res.status(500).json({ error: "Failed to create course" });
  }
});

router.get("/courses", async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const all = await db.query.courses.findMany({
    where: eq(courses.userId, userId),
  });
  return res.status(200).json(all);
});

router.get("/courses/:courseId", async (req: Request, res: Response) => {
  const courseId = routeParam(req.params.courseId);
  const userId = req.user!.id;
  if (!courseId) {
    return res.status(400).json({ error: "Course id is required" });
  }

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
    with: { topics: true },
  });

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  return res.status(200).json(course);
});

router.get("/courses/:courseId/documents", async (req: Request, res: Response) => {
  const courseId = routeParam(req.params.courseId);
  const userId = req.user!.id;
  if (!courseId) {
    return res.status(400).json({ error: "Course id is required" });
  }

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
  });
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const docs = await db.query.documents.findMany({
    where: eq(documents.courseId, courseId),
    with: {
      documentTopics: {
        with: {
          topic: true,
        },
      },
    },
  });

  const payload = docs.map((doc) => ({
    filePath: doc.filePath,
    title: doc.title,
    category: doc.category,
    sourcePath: doc.sourcePath,
    createdAt: doc.createdAt,
    topics: doc.documentTopics.map((item) => ({
      id: item.topicId,
      displayName: item.topic?.displayName ?? item.topicId,
    })),
  }));

  return res.status(200).json(payload);
});

router.post(
  "/courses/:courseId/documents",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const courseId = routeParam(req.params.courseId);
      if (!courseId) {
        return res.status(400).json({ error: "Course id is required" });
      }
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const userId = req.user!.id;
      const course = await db.query.courses.findFirst({
        where: and(eq(courses.id, courseId), eq(courses.userId, userId)),
      });
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const archivePath = await archiveFile(file.buffer, file.originalname);

      const isImage = file.mimetype.startsWith("image/");
      const rawText = isImage
        ? "__IMAGE__"
        : await extractText(file.buffer, file.mimetype);

      const existingTopics = await fetchExistingTopics(courseId);

      const result = await runIngestionModel(
        rawText,
        course,
        existingTopics,
        isImage ? file.buffer : undefined,
        isImage ? file.mimetype : undefined,
      );

      const filePath = await writeToRepository(result.content);

      try {
        await commitToDatabase(filePath, archivePath, courseId, result);
      } catch (err) {
        await fs.unlink(filePath).catch(() => undefined);
        throw err;
      }

      await embedAndIndex(filePath, result.content);

      return res.status(201).json({
        filePath,
        title: result.title,
        category: result.category,
        topics: result.topics,
      });
    } catch (err) {
      console.error("Ingestion failed:", err);
      return res.status(500).json({ error: "Ingestion failed" });
    }
  },
);

router.post("/context/semantic", async (req: Request, res: Response) => {
  try {
    const { query, limit, maxChunksPerDoc, courseId } = req.body ?? {};

    if (typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ error: "query is required" });
    }

    if (courseId && typeof courseId !== "string") {
      return res.status(400).json({ error: "courseId must be a string" });
    }

    const results = await semanticSearch({
      query,
      limit: typeof limit === "number" ? limit : undefined,
      maxChunksPerDoc:
        typeof maxChunksPerDoc === "number" ? maxChunksPerDoc : undefined,
      courseId,
    });

    return res.status(200).json({ query, results });
  } catch (err) {
    console.error("Semantic context search failed:", err);
    return res.status(500).json({ error: "Semantic context search failed" });
  }
});

router.get("/context/grep", async (req: Request, res: Response) => {
  try {
    const query = req.query.q;
    const courseId = req.query.courseId;
    const category = req.query.category;
    const limitRaw = req.query.limit;

    if (typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ error: "q query param is required" });
    }
    if (courseId && typeof courseId !== "string") {
      return res.status(400).json({ error: "courseId must be a string" });
    }
    if (category && typeof category !== "string") {
      return res.status(400).json({ error: "category must be a string" });
    }

    const limit =
      typeof limitRaw === "string" ? Number.parseInt(limitRaw, 10) : undefined;

    const results = await grepDocuments({
      query,
      limit,
      courseId: typeof courseId === "string" ? courseId : undefined,
      category: typeof category === "string" ? category : undefined,
    });

    return res.status(200).json({ query, results });
  } catch (err) {
    console.error("Grep context search failed:", err);
    return res.status(500).json({ error: "Grep context search failed" });
  }
});

router.get("/documents", async (req: Request, res: Response) => {
  const filePath = req.query.filePath;
  if (typeof filePath !== "string" || filePath.trim() === "") {
    return res.status(400).json({ error: "filePath query param is required" });
  }

  const document = await db.query.documents.findFirst({
    where: eq(documents.filePath, filePath),
  });
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  const repositoryRoot = path.resolve(process.cwd(), "repository");
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!resolvedPath.startsWith(repositoryRoot + path.sep)) {
    return res.status(400).json({ error: "Invalid document path" });
  }

  try {
    const content = await fs.readFile(resolvedPath, "utf-8");
    return res.status(200).json({
      filePath: document.filePath,
      title: document.title,
      category: document.category,
      content,
    });
  } catch (err) {
    console.error("Failed to read document content:", err);
    return res.status(500).json({ error: "Failed to read document content" });
  }
});

router.get("/documents/:id", async (req: Request, res: Response) => {
  const id = routeParam(req.params.id);
  if (!id || !/^[a-f0-9]{12}$/i.test(id)) {
    return res.status(400).json({ error: "Invalid document id" });
  }

  const filePath = path.join("repository", `${id}.md`);
  const document = await db.query.documents.findFirst({
    where: eq(documents.filePath, filePath),
  });
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  const repositoryRoot = path.resolve(process.cwd(), "repository");
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!resolvedPath.startsWith(repositoryRoot + path.sep)) {
    return res.status(400).json({ error: "Invalid document path" });
  }

  try {
    const content = await fs.readFile(resolvedPath, "utf-8");
    return res.status(200).json({
      filePath: document.filePath,
      title: document.title,
      category: document.category,
      content,
      sourcePath: document.sourcePath,
    });
  } catch (err) {
    console.error("Failed to read document content:", err);
    return res.status(500).json({ error: "Failed to read document content" });
  }
});

router.get("/archive", async (req: Request, res: Response) => {
  const filePath = req.query.filePath;
  if (typeof filePath !== "string" || filePath.trim() === "") {
    return res.status(400).json({ error: "filePath query param is required" });
  }

  const archiveRoot = path.resolve(process.cwd(), "archive");
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!resolvedPath.startsWith(archiveRoot + path.sep)) {
    return res.status(400).json({ error: "Invalid archive path" });
  }

  try {
    return res.sendFile(resolvedPath);
  } catch (err) {
    console.error("Failed to send archive:", err);
    return res.status(500).json({ error: "Failed to read archive" });
  }
});

router.get("/archive/:id", async (req: Request, res: Response) => {
  const id = routeParam(req.params.id);
  if (!id || !/^[a-z0-9]+(?:\.[a-z0-9]+)?$/i.test(id)) {
    return res.status(400).json({ error: "Invalid archive id" });
  }

  const archiveRoot = path.resolve(process.cwd(), "archive");
  const resolvedDir = path.resolve(archiveRoot);

  try {
    const entries = await fs.readdir(resolvedDir);
    const directMatch = entries.find((entry) => entry === id);
    const prefixMatch = entries.find((entry) => entry.startsWith(`${id}.`));
    const filename = directMatch ?? prefixMatch;

    if (!filename) {
      return res.status(404).json({ error: "Archive not found" });
    }

    return res.sendFile(path.join(resolvedDir, filename));
  } catch (err) {
    console.error("Failed to send archive:", err);
    return res.status(500).json({ error: "Failed to read archive" });
  }
});

export default router;
