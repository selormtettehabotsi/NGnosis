import { relations } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").notNull(),
});

export const topics = sqliteTable("topics", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  displayName: text("display_name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  topics: many(topics),
}));

export const topicsRelations = relations(topics, ({ one }) => ({
  course: one(courses, {
    fields: [topics.courseId],
    references: [courses.id],
  }),
}));

export const documents = sqliteTable("documents", {
  filePath: text("file_path").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  sourcePath: text("source_path"),
  createdAt: text("created_at").notNull(),
});

export const documentTopics = sqliteTable(
  "document_topics",
  {
    filePath: text("file_path")
      .notNull()
      .references(() => documents.filePath),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.filePath, table.topicId] }),
  }),
);

export const documentsRelations = relations(documents, ({ many, one }) => ({
  documentTopics: many(documentTopics),
  course: one(courses, {
    fields: [documents.courseId],
    references: [courses.id],
  }),
}));

export const documentTopicsRelations = relations(documentTopics, ({ one }) => ({
  document: one(documents, {
    fields: [documentTopics.filePath],
    references: [documents.filePath],
  }),
  topic: one(topics, {
    fields: [documentTopics.topicId],
    references: [topics.id],
  }),
}));

export const courseProgress = sqliteTable("course_progress", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id),
  signalType: text("signal_type").notNull(),
  filePath: text("file_path").references(() => documents.filePath),
  topicId: text("topic_id").references(() => topics.id),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const assignmentProgress = sqliteTable("assignment_progress", {
  id: text("id").primaryKey(),
  filePath: text("file_path")
    .notNull()
    .references(() => documents.filePath),
  status: text("status").notNull(),
  attempts: integer("attempts").notNull().default(0),
  lastAttemptAt: text("last_attempt_at"),
  modelNotes: text("model_notes"),
});
