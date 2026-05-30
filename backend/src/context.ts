import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import { db } from "./db";
import { documents } from "./db/schema";
import { getEmbedding } from "./embedding";
import { vectorDb } from "./vector";

type TopicSummary = {
  id: string;
  displayName: string;
};

type DocumentSummary = {
  filePath: string;
  title: string;
  category: string;
  sourcePath: string | null;
  courseId: string;
  createdAt: string;
  topics: TopicSummary[];
};

type SemanticSearchOptions = {
  query: string;
  limit?: number;
  maxChunksPerDoc?: number;
  courseId?: string;
};

const DEFAULT_SEMANTIC_LIMIT = 8;
const DEFAULT_CHUNKS_PER_DOC = 2;
const DEFAULT_GREP_LIMIT = 50;

function clampLimit(value: number, fallback: number, max: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.min(value, max);
}

function buildDocumentSummary(doc: {
  filePath: string;
  title: string;
  category: string;
  sourcePath: string | null;
  courseId: string;
  createdAt: string;
  documentTopics: Array<{ topicId: string; topic: { displayName: string } | null }>;
}): DocumentSummary {
  return {
    filePath: doc.filePath,
    title: doc.title,
    category: doc.category,
    sourcePath: doc.sourcePath ?? null,
    courseId: doc.courseId,
    createdAt: doc.createdAt,
    topics: doc.documentTopics.map((item) => ({
      id: item.topicId,
      displayName: item.topic?.displayName ?? item.topicId,
    })),
  };
}

export async function semanticSearch(options: SemanticSearchOptions) {
  const trimmed = options.query.trim();
  if (!trimmed) {
    return [];
  }

  const limit = clampLimit(options.limit ?? DEFAULT_SEMANTIC_LIMIT, DEFAULT_SEMANTIC_LIMIT, 50);
  const maxChunksPerDoc = clampLimit(
    options.maxChunksPerDoc ?? DEFAULT_CHUNKS_PER_DOC,
    DEFAULT_CHUNKS_PER_DOC,
    10,
  );

  const embedding = await getEmbedding(trimmed);
  const candidateLimit = Math.max(limit * 5, limit);
  const matches = vectorDb.search(embedding, candidateLimit);

  if (matches.length === 0) {
    return [];
  }

  const uniquePaths = Array.from(new Set(matches.map((match) => match.filePath)));
  const docConditions: SQL[] = [inArray(documents.filePath, uniquePaths)];

  if (options.courseId) {
    docConditions.push(eq(documents.courseId, options.courseId));
  }

  const docs = await db.query.documents.findMany({
    where: and(...docConditions),
    with: {
      documentTopics: {
        with: {
          topic: true,
        },
      },
    },
  });

  const docMap = new Map(docs.map((doc) => [doc.filePath, doc]));
  const perDocCount = new Map<string, number>();
  const results: Array<{
    filePath: string;
    chunkIndex: number;
    chunk: string;
    distance: number;
    document: DocumentSummary;
  }> = [];

  for (const match of matches) {
    const doc = docMap.get(match.filePath);
    if (!doc) {
      continue;
    }
    const count = perDocCount.get(match.filePath) ?? 0;
    if (count >= maxChunksPerDoc) {
      continue;
    }

    perDocCount.set(match.filePath, count + 1);
    results.push({
      filePath: match.filePath,
      chunkIndex: match.chunkIndex,
      chunk: match.chunk,
      distance: match.distance,
      document: buildDocumentSummary(doc),
    });

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

type GrepSearchOptions = {
  query: string;
  limit?: number;
  courseId?: string;
  category?: string;
};

export async function grepDocuments(options: GrepSearchOptions) {
  const trimmed = options.query.trim();
  if (!trimmed) {
    return [];
  }

  const limit = clampLimit(options.limit ?? DEFAULT_GREP_LIMIT, DEFAULT_GREP_LIMIT, 200);
  const pattern = `%${trimmed.toLowerCase()}%`;
  const conditions: SQL[] = [
    sql`(
      lower(${documents.title}) like ${pattern}
      or lower(${documents.filePath}) like ${pattern}
      or lower(${documents.category}) like ${pattern}
      or lower(${documents.sourcePath}) like ${pattern}
      or exists (
        select 1
        from document_topics dt
        join topics t on t.id = dt.topic_id
        where dt.file_path = ${documents.filePath}
          and (
            lower(t.id) like ${pattern}
            or lower(t.display_name) like ${pattern}
          )
      )
    )`,
  ];

  if (options.courseId) {
    conditions.push(eq(documents.courseId, options.courseId));
  }
  if (options.category) {
    conditions.push(eq(documents.category, options.category));
  }

  const docs = await db.query.documents.findMany({
    where: and(...conditions),
    with: {
      documentTopics: {
        with: {
          topic: true,
        },
      },
    },
    limit,
  });

  return docs.map(buildDocumentSummary);
}
