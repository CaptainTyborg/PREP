import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  targetScore: integer("target_score").default(300),
  preferredSubjects: jsonb("preferred_subjects").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // No foreign key constraint for simplicity in mock, or we can add it
  examType: text("exam_type").notNull(), // 'mock' or 'practice'
  subjects: jsonb("subjects").notNull(), // Array of subjects selected
  answers: jsonb("answers").notNull(), // Record<questionId, selectedOption>
  score: integer("score").notNull(),
  subjectScores: jsonb("subject_scores").notNull(), // Record<subject, score>
  timeTaken: integer("time_taken").notNull(), // In seconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAttemptSchema = createInsertSchema(attempts).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;

export interface Question {
  id: string;
  subject: string;
  topic: string;
  year: string;
  difficulty: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  explanation: string;
}

export type QuestionSet = Record<string, Question[]>;

export type UpdateUserRequest = Partial<InsertUser>;
