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
