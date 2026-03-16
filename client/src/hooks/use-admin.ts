import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useAdminStatus() {
  return useQuery({
    queryKey: [api.admin.me.path],
    queryFn: async () => {
      const res = await fetch(api.admin.me.path, { credentials: "include" });
      if (!res.ok) return { isAdmin: false };
      return res.json() as Promise<{ isAdmin: boolean }>;
    },
    retry: false,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (creds: { username: string; password: string }) => {
      const res = await fetch(api.admin.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creds),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Invalid credentials");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.me.path] });
      toast({ title: "Admin access granted", description: "Welcome to the admin dashboard." });
      setLocation("/admin");
    },
    onError: (e: Error) => {
      toast({ title: "Login Failed", description: e.message, variant: "destructive" });
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async () => {
      await fetch(api.admin.logout.path, { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.me.path] });
      setLocation("/login");
    },
  });
}

export function useAdminStudents() {
  return useQuery({
    queryKey: [api.admin.students.path],
    queryFn: async () => {
      const res = await fetch(api.admin.students.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch students");
      return api.admin.students.responses[200].parse(await res.json());
    },
  });
}

export function useStudentAttempts(userId: number | null) {
  return useQuery({
    queryKey: [api.admin.studentAttempts.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.admin.studentAttempts.path, { userId: userId! });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attempts");
      return res.json();
    },
    enabled: userId !== null,
  });
}
