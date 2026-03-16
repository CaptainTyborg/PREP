import { useLeaderboard } from "@/hooks/use-cbt";
import { useUser } from "@/hooks/use-auth";
import { Trophy, Medal, Crown, Users, Flame } from "lucide-react";

const RANK_STYLES: Record<number, { bg: string; text: string; icon: JSX.Element; label: string }> = {
  1: {
    bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/50",
    text: "text-yellow-400",
    icon: <Crown className="h-5 w-5 text-yellow-400" />,
    label: "Gold",
  },
  2: {
    bg: "bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/50",
    text: "text-slate-300",
    icon: <Medal className="h-5 w-5 text-slate-300" />,
    label: "Silver",
  },
  3: {
    bg: "bg-gradient-to-r from-orange-600/20 to-amber-700/10 border-orange-500/50",
    text: "text-orange-400",
    icon: <Medal className="h-5 w-5 text-orange-400" />,
    label: "Bronze",
  },
};

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.min(100, Math.round((score / 400) * 100));
  const color =
    pct >= 70 ? "bg-primary" : pct >= 50 ? "bg-amber-500" : "bg-destructive";
  return (
    <div className="flex items-center gap-3 min-w-[160px]">
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold tabular-nums w-16 text-right">
        {score} <span className="font-normal text-muted-foreground text-xs">/ 400</span>
      </span>
    </div>
  );
}

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useLeaderboard();
  const { data: currentUser } = useUser();

  const myEntry = leaderboard?.find((e) => e.userId === currentUser?.id);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-full mb-4">
          <Trophy className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Leaderboard</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Top students ranked by their best JAMB mock exam score.
        </p>
      </div>

      {/* My Rank Banner */}
      {myEntry && (
        <div className="glass-card rounded-2xl p-5 mb-8 flex items-center gap-4 border border-primary/30 bg-primary/5">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-lg">
            #{myEntry.rank}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">Your Position</p>
            <p className="font-bold text-lg">{myEntry.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">{myEntry.bestScore}</p>
            <p className="text-xs text-muted-foreground">Best score</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[48px_1fr_160px_80px] gap-4 px-6 py-3 border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Rank</span>
          <span>Student</span>
          <span>Best Score</span>
          <span className="text-right">Attempts</span>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (!leaderboard || leaderboard.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
            <Users className="h-12 w-12 opacity-30" />
            <p className="text-lg font-medium">No scores yet</p>
            <p className="text-sm">Be the first to complete a mock exam!</p>
          </div>
        )}

        {!isLoading && leaderboard && leaderboard.length > 0 && (
          <div className="divide-y divide-border/50">
            {leaderboard.map((entry) => {
              const rankStyle = RANK_STYLES[entry.rank];
              const isMe = entry.userId === currentUser?.id;
              return (
                <div
                  key={entry.userId}
                  data-testid={`leaderboard-row-${entry.userId}`}
                  className={`
                    grid grid-cols-[48px_1fr_160px_80px] gap-4 items-center px-6 py-4 transition-colors
                    ${isMe ? "bg-primary/8 border-l-4 border-l-primary" : "hover:bg-secondary/30"}
                    ${rankStyle ? rankStyle.bg : ""}
                  `}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center">
                    {rankStyle ? (
                      <span className={`flex items-center gap-1 font-bold ${rankStyle.text}`}>
                        {rankStyle.icon}
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-bold text-sm">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0 border border-border">
                      {entry.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                        {entry.name}
                        {isMe && (
                          <span className="ml-2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-bold uppercase">You</span>
                        )}
                      </p>
                      {entry.rank <= 3 && (
                        <p className={`text-xs ${rankStyle?.text}`}>{rankStyle?.label} Medalist</p>
                      )}
                    </div>
                  </div>

                  {/* Score Bar */}
                  <ScoreBadge score={entry.bestScore} />

                  {/* Attempts */}
                  <div className="text-right flex items-center justify-end gap-1 text-muted-foreground text-sm">
                    <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    <span>{entry.totalAttempts}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Crown className="h-3.5 w-3.5 text-yellow-400" /> 1st Place</span>
        <span className="flex items-center gap-1"><Medal className="h-3.5 w-3.5 text-slate-300" /> 2nd Place</span>
        <span className="flex items-center gap-1"><Medal className="h-3.5 w-3.5 text-orange-400" /> 3rd Place</span>
        <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-400" /> Total Attempts</span>
      </div>
    </div>
  );
}
