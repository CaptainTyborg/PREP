import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminStatus, useAdminLogout, useAdminStudents, useStudentAttempts } from "@/hooks/use-admin";
import {
  Users, Trophy, Target, TrendingUp, LogOut, ChevronDown, ChevronUp,
  BookOpen, Clock, ShieldCheck, X
} from "lucide-react";

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="glass-card rounded-2xl p-6 flex items-center gap-4 border-l-4 border-l-destructive">
      <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border/50 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <h4 className="text-2xl font-bold">{value}</h4>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ScoreBar({ score, max = 400 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color = pct >= 70 ? "bg-primary" : pct >= 50 ? "bg-amber-500" : "bg-destructive";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold tabular-nums w-8 text-right">{score}</span>
    </div>
  );
}

function StudentAttemptsDrawer({ userId, name, onClose }: { userId: number; name: string; onClose: () => void }) {
  const { data: attempts, isLoading } = useStudentAttempts(userId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-card border-l border-border h-full overflow-y-auto p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-sm text-muted-foreground">Exam History</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (!attempts || attempts.length === 0) && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <BookOpen className="h-10 w-10 opacity-30" />
            <p>No attempts yet</p>
          </div>
        )}

        {!isLoading && attempts?.map((a: any, i: number) => (
          <div key={a.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold capitalize">{a.examType} Exam #{attempts.length - i}</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {a.timeTaken ? `${Math.floor(a.timeTaken / 60)}m ${a.timeTaken % 60}s` : "—"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent shrink-0" />
                <span className="text-2xl font-bold text-accent">{a.score}</span>
                <span className="text-muted-foreground text-sm">/ 400</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : ""}
              </span>
            </div>
            {a.subjects && (
              <div className="flex flex-wrap gap-1 mt-3">
                {(a.subjects as string[]).map((s: string) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border font-medium">{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: adminStatus, isLoading: adminLoading } = useAdminStatus();
  const logoutMutation = useAdminLogout();
  const { data: students, isLoading: studentsLoading } = useAdminStudents();
  const [selectedStudent, setSelectedStudent] = useState<{ userId: number; name: string } | null>(null);
  const [sortBy, setSortBy] = useState<"bestScore" | "totalAttempts" | "averageScore">("bestScore");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  if (adminLoading) return null;
  if (!adminStatus?.isAdmin) {
    setLocation("/admin/login");
    return null;
  }

  const totalStudents = students?.length ?? 0;
  const totalAttempts = students?.reduce((sum, s) => sum + s.totalAttempts, 0) ?? 0;
  const topScore = students ? Math.max(0, ...students.map((s) => s.bestScore)) : 0;
  const avgScore = students?.length
    ? Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length)
    : 0;

  const sorted = [...(students ?? [])].sort((a, b) => {
    const diff = a[sortBy] - b[sortBy];
    return sortDir === "desc" ? -diff : diff;
  });

  const toggleSort = (col: typeof sortBy) => {
    if (col === sortBy) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (col !== sortBy) return null;
    return sortDir === "desc" ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />;
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {selectedStudent && (
        <StudentAttemptsDrawer
          userId={selectedStudent.userId}
          name={selectedStudent.name}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <ShieldCheck className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor student progress across all exams</p>
          </div>
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-primary" />} label="Total Students" value={totalStudents} />
        <StatCard icon={<BookOpen className="text-blue-400" />} label="Total Attempts" value={totalAttempts} />
        <StatCard icon={<Trophy className="text-accent" />} label="Top Score" value={`${topScore} / 400`} />
        <StatCard icon={<Target className="text-green-400" />} label="Avg Score" value={`${avgScore} / 400`} />
      </div>

      {/* Students Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/20">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Student Progress
          </h2>
          <span className="text-sm text-muted-foreground">{totalStudents} students</span>
        </div>

        {/* Column Headers */}
        <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px_120px] gap-4 px-6 py-3 border-b border-border bg-secondary/10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Student</span>
          <button onClick={() => toggleSort("bestScore")} className="flex items-center gap-1 hover:text-foreground transition-colors">
            Best Score <SortIcon col="bestScore" />
          </button>
          <button onClick={() => toggleSort("averageScore")} className="flex items-center gap-1 hover:text-foreground transition-colors">
            Avg Score <SortIcon col="averageScore" />
          </button>
          <button onClick={() => toggleSort("totalAttempts")} className="flex items-center gap-1 hover:text-foreground transition-colors">
            Attempts <SortIcon col="totalAttempts" />
          </button>
          <span>Last Active</span>
        </div>

        {studentsLoading && (
          <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        )}

        {!studentsLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <Users className="h-10 w-10 opacity-30" />
            <p>No students registered yet</p>
          </div>
        )}

        {!studentsLoading && (
          <div className="divide-y divide-border/50">
            {sorted.map((student) => (
              <button
                key={student.userId}
                data-testid={`admin-student-row-${student.userId}`}
                onClick={() => setSelectedStudent({ userId: student.userId, name: student.name })}
                className="w-full text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="grid md:grid-cols-[1fr_120px_120px_120px_120px] gap-4 items-center px-6 py-4">
                  {/* Student info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-sm shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>
                  </div>

                  {/* Best Score */}
                  <div className="hidden md:block">
                    <ScoreBar score={student.bestScore} />
                  </div>

                  {/* Avg Score */}
                  <div className="hidden md:block">
                    <ScoreBar score={student.averageScore} />
                  </div>

                  {/* Attempts */}
                  <div className="hidden md:flex items-center gap-1 text-sm font-medium">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {student.totalAttempts}
                  </div>

                  {/* Last Active */}
                  <div className="hidden md:block text-xs text-muted-foreground">
                    {student.lastAttemptAt
                      ? new Date(student.lastAttemptAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })
                      : "Never"}
                  </div>

                  {/* Mobile summary */}
                  <div className="md:hidden flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">{student.totalAttempts} attempts</span>
                    <span className="font-bold text-accent">{student.bestScore} / 400</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
