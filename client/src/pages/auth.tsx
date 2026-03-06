import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";
import { BookOpen } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, name: name || undefined });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -z-10" />

        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 bg-primary/10 flex items-center justify-center rounded-2xl border border-primary/20">
            <BookOpen className="h-8 w-8 text-accent" />
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-muted-foreground mb-8">Enter your details to access your dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="student@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name (Optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="To create a new account"
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loginMutation.isPending ? "Authenticating..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
