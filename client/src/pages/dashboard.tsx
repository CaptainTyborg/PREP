import { useUser } from "@/hooks/use-auth";
import { useAttempts } from "@/hooks/use-cbt";
import { Link, useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Trophy, Flame, History, BookOpen, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: attempts, isLoading: attemptsLoading } = useAttempts();
  const [, setLocation] = useLocation();

  if (userLoading || attemptsLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const sortedAttempts = attempts?.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()) || [];
  const highestScore = sortedAttempts.reduce((max, a) => Math.max(max, a.score), 0);
  const averageScore = sortedAttempts.length 
    ? Math.round(sortedAttempts.reduce((acc, a) => acc + a.score, 0) / sortedAttempts.length) 
    : 0;

  const chartData = sortedAttempts.slice(0, 10).reverse().map((a, i) => ({
    name: `Attempt ${i + 1}`,
    score: a.score,
  }));

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground mt-2">Ready to crush your target score of <span className="text-accent font-bold">{user.targetScore}</span>?</p>
        </div>
        <Link href="/practice" className="px-6 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all w-fit">
          Start Practice Exam
        </Link>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Trophy className="text-accent" />} title="Highest Score" value={`${highestScore} / 400`} />
        <StatCard icon={<Target className="text-primary" />} title="Average Score" value={`${averageScore} / 400`} />
        <StatCard icon={<History className="text-blue-400" />} title="Total Attempts" value={sortedAttempts.length.toString()} />
        <StatCard icon={<Flame className="text-orange-500" />} title="Current Streak" value="3 Days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Performance History
          </h3>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 400]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                <p>No attempts yet. Start practicing!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Recent Exams</h3>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">Last 5</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
            {sortedAttempts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center my-auto">No history available.</p>
            )}
            {sortedAttempts.slice(0, 5).map(attempt => (
              <Link 
                key={attempt.id} 
                href={`/review/${attempt.id}`}
                className="group flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors capitalize">{attempt.examType} Exam</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(attempt.createdAt!).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block font-bold text-accent">{attempt.score}</span>
                    <span className="text-[10px] text-muted-foreground">/ 400</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border-l-4 border-l-primary hover:border-l-accent transition-colors">
      <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border/50">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold">{value}</h4>
      </div>
    </div>
  );
}

// Ensure icon import is used to prevent compiler warning
import { TrendingUp } from "lucide-react";
