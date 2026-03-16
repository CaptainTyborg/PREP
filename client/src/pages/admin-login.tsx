import { useState } from "react";
import { useAdminLogin } from "@/hooks/use-admin";
import { ShieldCheck } from "lucide-react";
import { Link } from "wouter";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />

        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 bg-destructive/10 flex items-center justify-center rounded-2xl border border-destructive/20">
            <ShieldCheck className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold text-center mb-2">Admin Portal</h2>
        <p className="text-center text-muted-foreground mb-8">Restricted area — authorized personnel only.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <input
              type="text"
              required
              value={username}
              data-testid="input-admin-username"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-destructive focus:ring-4 focus:ring-destructive/10 transition-all outline-none"
              placeholder="admin"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              data-testid="input-admin-password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-destructive focus:ring-4 focus:ring-destructive/10 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            data-testid="button-admin-login"
            disabled={loginMutation.isPending}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-destructive to-destructive/80 text-white shadow-lg shadow-destructive/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loginMutation.isPending ? "Authenticating..." : "Access Admin Dashboard"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Not an admin?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Student login
          </Link>
        </p>
      </div>
    </div>
  );
}
