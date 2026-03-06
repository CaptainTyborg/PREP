import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/audio/client"; // reusing OpenAI client
import { Question } from "@shared/schema";
import fs from "fs";
import path from "path";

// Mock JSON database for questions
function getMockQuestions(subject: string, count: number): Question[] {
  // We'll generate a few mock questions on the fly for the selected subject
  const questions: Question[] = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      id: `${subject}-${i}`,
      subject,
      topic: "General",
      year: "2023",
      difficulty: "medium",
      question: `This is mock question ${i} for ${subject}. What is the correct answer?`,
      options: {
        A: `Option A for Q${i}`,
        B: `Option B for Q${i}`,
        C: `Option C for Q${i}`,
        D: `Option D for Q${i}`,
      },
      correct_answer: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
      explanation: `The correct answer is detailed here for question ${i} in ${subject}.`
    });
  }
  return questions;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // A simple hack to mock auth - we'll just use a default user
  let currentUserId = 1;

  app.get(api.users.me.path, async (req, res) => {
    try {
      const user = await storage.getUser(currentUserId);
      res.json(user || null);
    } catch (e) {
      res.json(null);
    }
  });

  app.post(api.users.login.path, async (req, res) => {
    try {
      const input = api.users.login.input.parse(req.body);
      let user = await storage.getUserByEmail(input.email);
      if (!user) {
        user = await storage.createUser({
          email: input.email,
          name: input.name || input.email.split('@')[0],
          targetScore: 300,
          preferredSubjects: ["Use of English", "Mathematics", "Physics", "Chemistry"]
        });
      }
      currentUserId = user.id;
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.patch(api.users.update.path, async (req, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(currentUserId, input);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.get(api.attempts.list.path, async (req, res) => {
    const attempts = await storage.getAttempts(currentUserId);
    res.json(attempts);
  });

  app.get(api.attempts.get.path, async (req, res) => {
    const attempt = await storage.getAttempt(Number(req.params.id));
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    res.json(attempt);
  });

  app.post(api.attempts.create.path, async (req, res) => {
    try {
      const input = api.attempts.create.input.parse(req.body);
      const attempt = await storage.createAttempt({ ...input, userId: currentUserId });
      res.status(201).json(attempt);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.post(api.questions.generate.path, async (req, res) => {
    try {
      const { subjects } = api.questions.generate.input.parse(req.body);
      const response: Record<string, Question[]> = {};
      
      for (const subject of subjects) {
        // Use of English 60, others 40
        const count = subject === "Use of English" ? 60 : 40;
        response[subject] = getMockQuestions(subject, count);
      }

      res.json(response);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subjects format" });
      }
      res.status(500).json({ message: "Internal Error" });
    }
  });

  app.post(api.ai.tutor.path, async (req, res) => {
    try {
      const { question, selectedAnswer } = api.ai.tutor.input.parse(req.body);
      
      const prompt = `You are a friendly, encouraging AI tutor helping a student prepare for the JAMB UTME exam. 
The student was asked the following question in ${question.subject}:
"${question.question}"

Options:
A: ${question.options.A}
B: ${question.options.B}
C: ${question.options.C}
D: ${question.options.D}

The correct answer is ${question.correct_answer}.
The student selected ${selectedAnswer}.

Explain why the correct answer is right, and why the student's selected answer is wrong (if it is wrong). Keep it concise, clear, and encouraging.`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: "You are a helpful JAMB UTME prep tutor." },
          { role: "user", content: prompt }
        ]
      });

      res.json({ explanation: aiResponse.choices[0].message.content });
    } catch (err) {
      console.error("AI Error:", err);
      res.status(500).json({ message: "Failed to generate AI explanation" });
    }
  });

  return httpServer;
}
