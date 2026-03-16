import { db } from "./db";
import {
  users,
  attempts,
  type User,
  type InsertUser,
  type UpdateUserRequest,
  type Attempt,
  type InsertAttempt
} from "@shared/schema";
import { eq, desc, max, count, sql } from "drizzle-orm";

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  bestScore: number;
  totalAttempts: number;
}

export interface StudentProgress {
  userId: number;
  name: string;
  email: string;
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  lastAttemptAt: string | null;
  subjects: string[];
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUserRequest): Promise<User>;
  
  // Attempts
  getAttempts(userId: number): Promise<Attempt[]>;
  getAttempt(id: number): Promise<Attempt | undefined>;
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;

  // Leaderboard
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;

  // Admin
  getAllStudentsProgress(): Promise<StudentProgress[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: UpdateUserRequest): Promise<User> {
    const [updated] = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getAttempts(userId: number): Promise<Attempt[]> {
    return await db.select().from(attempts).where(eq(attempts.userId, userId));
  }

  async getAttempt(id: number): Promise<Attempt | undefined> {
    const [attempt] = await db.select().from(attempts).where(eq(attempts.id, id));
    return attempt;
  }

  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const [created] = await db.insert(attempts).values(attempt).returning();
    return created;
  }

  async getAllStudentsProgress(): Promise<StudentProgress[]> {
    const allUsers = await db.select().from(users);
    const allAttempts = await db.select().from(attempts);

    return allUsers.map((user) => {
      const userAttempts = allAttempts.filter((a) => a.userId === user.id);
      const scores = userAttempts.map((a) => a.score);
      const sorted = [...userAttempts].sort(
        (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
      const subjectSets = new Set<string>();
      userAttempts.forEach((a) => {
        ((a.subjects as string[]) || []).forEach((s) => subjectSets.add(s));
      });
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        totalAttempts: userAttempts.length,
        bestScore: scores.length ? Math.max(...scores) : 0,
        averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
        lastAttemptAt: sorted[0]?.createdAt ? new Date(sorted[0].createdAt).toISOString() : null,
        subjects: Array.from(subjectSets),
      };
    });
  }

  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const rows = await db
      .select({
        userId: attempts.userId,
        name: users.name,
        bestScore: max(attempts.score),
        totalAttempts: count(attempts.id),
      })
      .from(attempts)
      .innerJoin(users, eq(attempts.userId, users.id))
      .groupBy(attempts.userId, users.name)
      .orderBy(desc(max(attempts.score)))
      .limit(limit);

    return rows.map((row, idx) => ({
      rank: idx + 1,
      userId: row.userId,
      name: row.name,
      bestScore: row.bestScore ?? 0,
      totalAttempts: Number(row.totalAttempts),
    }));
  }
}

export const storage = new DatabaseStorage();
