import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Helper function to handle response parsing safely
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw new Error(`Invalid response format for ${label}`);
  }
  return result.data;
}

export function useUser() {
  return useQuery({
    queryKey: [api.users.me.path],
    queryFn: async () => {
      const res = await fetch(api.users.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return parseWithLogging(api.users.me.responses[200], data, "users.me");
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (credentials: z.infer<typeof api.users.login.input>) => {
      const validated = api.users.login.input.parse(credentials);
      const res = await fetch(api.users.login.path, {
        method: api.users.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = parseWithLogging(api.users.login.responses[400], data, "users.login.error");
          throw new Error(error.message);
        }
        throw new Error("Login failed");
      }
      return parseWithLogging(api.users.login.responses[200], data, "users.login.success");
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.users.me.path], user);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
