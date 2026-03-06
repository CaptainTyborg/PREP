import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw new Error(`Invalid response format for ${label}`);
  }
  return result.data;
}

export function useAttempts() {
  return useQuery({
    queryKey: [api.attempts.list.path],
    queryFn: async () => {
      const res = await fetch(api.attempts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attempts");
      return parseWithLogging(api.attempts.list.responses[200], await res.json(), "attempts.list");
    },
  });
}

export function useAttempt(id: number) {
  return useQuery({
    queryKey: [api.attempts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.attempts.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch attempt");
      return parseWithLogging(api.attempts.get.responses[200], await res.json(), "attempts.get");
    },
    enabled: !!id,
  });
}

export function useCreateAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attemptData: z.infer<typeof api.attempts.create.input>) => {
      const validated = api.attempts.create.input.parse(attemptData);
      const res = await fetch(api.attempts.create.path, {
        method: api.attempts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error(data.message || "Validation failed");
        }
        throw new Error("Failed to create attempt");
      }
      return parseWithLogging(api.attempts.create.responses[201], data, "attempts.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attempts.list.path] });
    },
  });
}

export function useGenerateQuestions() {
  return useMutation({
    mutationFn: async (payload: z.infer<typeof api.questions.generate.input>) => {
      const validated = api.questions.generate.input.parse(payload);
      const res = await fetch(api.questions.generate.path, {
        method: api.questions.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to generate questions");
      return parseWithLogging(api.questions.generate.responses[200], data, "questions.generate");
    },
  });
}

export function useAiTutor() {
  return useMutation({
    mutationFn: async (payload: z.infer<typeof api.ai.tutor.input>) => {
      const validated = api.ai.tutor.input.parse(payload);
      const res = await fetch(api.ai.tutor.path, {
        method: api.ai.tutor.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Failed to get AI explanation");
      return parseWithLogging(api.ai.tutor.responses[200], data, "ai.tutor");
    },
  });
}
