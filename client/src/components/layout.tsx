import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-auth";
import { BookOpen, Home, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();
  const [location] = useLocation();

  const isExamRoute = location === "/cbt";

  if (isExamRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6 text-accent" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">PREP<span className="text-primary">.ng</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-accent ${location === "/" ? "text-accent" : "text-muted-foreground"}`}>
              Home
            </Link>
            {user && (
              <>
                <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-accent ${location === "/dashboard" ? "text-accent" : "text-muted-foreground"}`}>
                  Dashboard
                </Link>
                <Link href="/practice" className={`text-sm font-medium transition-colors hover:text-accent ${location === "/practice" ? "text-accent" : "text-muted-foreground"}`}>
                  Practice
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="hover:text-destructive hover:bg-destructive/10" onClick={() => {
                  // Mock logout by clearing location / reloading app to clear state
                  window.location.href = "/";
                }}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        {children}
      </main>

      <footer className="border-t border-border/40 py-8 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            <span className="font-display font-semibold text-lg text-muted-foreground">PREP.ng</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PREP.ng JAMB Simulator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
