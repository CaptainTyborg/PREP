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
import { eq } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
