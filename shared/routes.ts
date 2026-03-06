import { z } from "zod";
import { insertUserSchema, insertAttemptSchema, users, attempts } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Question schema to type API response
const QuestionResponseSchema = z.object({
  id: z.string(),
  subject: z.string(),
  topic: z.string(),
  year: z.string(),
  difficulty: z.string(),
  question: z.string(),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
  }),
  correct_answer: z.string(),
  explanation: z.string(),
});

export const api = {
  users: {
    me: {
      method: "GET" as const,
      path: "/api/users/me" as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>().nullable(),
      }
    },
    login: {
      method: "POST" as const,
      path: "/api/users/login" as const,
      input: z.object({ email: z.string().email(), name: z.string().optional() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    update: {
      method: "PATCH" as const,
      path: "/api/users/me" as const,
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
      }
    }
  },
  attempts: {
    list: {
      method: "GET" as const,
      path: "/api/attempts" as const,
      responses: {
        200: z.array(z.custom<typeof attempts.$inferSelect>()),
      }
    },
    create: {
      method: "POST" as const,
      path: "/api/attempts" as const,
      input: insertAttemptSchema,
      responses: {
        201: z.custom<typeof attempts.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    get: {
      method: "GET" as const,
      path: "/api/attempts/:id" as const,
      responses: {
        200: z.custom<typeof attempts.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  questions: {
    generate: {
      method: "POST" as const,
      path: "/api/questions/generate" as const,
      input: z.object({
        subjects: z.array(z.string()),
      }),
      responses: {
        200: z.record(z.string(), z.array(QuestionResponseSchema)),
        400: errorSchemas.validation,
      }
    }
  },
  ai: {
    tutor: {
      method: "POST" as const,
      path: "/api/ai/tutor" as const,
      input: z.object({
        question: QuestionResponseSchema,
        selectedAnswer: z.string(),
      }),
      responses: {
        200: z.object({
          explanation: z.string()
        }),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
