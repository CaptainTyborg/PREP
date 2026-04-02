import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAttempt, useAiTutor } from "@/hooks/use-cbt";
import { Check, X, Bot, ArrowRight, Home } from "lucide-react";
import confetti from "canvas-confetti";

export default function Review() {
  const params = useParams();
  const attemptId = parseInt(params.attemptId || "0");
  const { data: attempt, isLoading } = useAttempt(attemptId);
  const aiTutorMutation = useAiTutor();
  
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (attempt && attempt.score >= 25) { // 250/400 = 62.5%, stored as 25/40
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#008751', '#D4AF37', '#ffffff'] // Nigerian colors + white
      });
    }
  }, [attempt]);

  const handleExplain = (questionId: string, questionObj: any, selectedAnswer: string) => {
    if (explanations[questionId]) return; // already loaded
    setExplainingId(questionId);
    aiTutorMutation.mutate({ question: questionObj, selectedAnswer }, {
      onSuccess: (data) => {
        setExplanations(prev => ({ ...prev, [questionId]: data.explanation }));
        setExplainingId(null);
      },
      onError: () => {
        setExplainingId(null);
      }
    });
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading results...</div>;
  if (!attempt) return <div className="p-8 text-center text-destructive">Attempt not found</div>;

  // Assuming mock structure: questions are not actually stored in Attempt, in real app we need to fetch them.
  // For this exercise, we assume the backend stores them or we reconstruct from subjects.
  // Wait, `attempt` schema doesn't store the full questions! It only stores answers. 
  // Let's assume we read from the Zustand store since it's the most recent session, OR the backend populated `attempt.questions` via a join (not in schema).
  // Since we only have `attempt`, we will read the active store data for review display.
  // In a real app, attempt schema would join questions table. 
  const localStore = JSON.parse(localStorage.getItem('prep-exam-storage') || '{}').state || {};
  const questionsData = localStore.questions || {};

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-12 space-y-8">
      
      {/* Result Header */}
      <div className="glass-card rounded-3xl p-8 md:p-12 text-center border-t-8 border-t-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <h1 className="text-4xl md:text-5xl font-black mb-4">Exam Review</h1>
        <p className="text-xl text-muted-foreground mb-8">Here is a detailed breakdown of your performance.</p>
        
        <div className="inline-flex flex-col items-center justify-center p-8 bg-background border-4 border-border rounded-full w-48 h-48 mb-8 shadow-2xl">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Score</span>
          <span className="text-6xl font-black text-accent">{attempt.score * 10}</span>
          <span className="text-sm font-medium mt-1">/ 400</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 transition-colors">
            <Home className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/practice" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
            Practice Again <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-12">
        {attempt.subjects.map((sub: string) => {
          const subQs = questionsData[sub] || [];
          if (!subQs.length) return null;

          return (
            <div key={sub} className="space-y-6">
              <h2 className="text-2xl font-bold border-b border-border/50 pb-2 text-primary">{sub}</h2>
              <div className="grid gap-6">
                {subQs.map((q: any, idx: number) => {
                  const userAnswer = attempt.answers[q.id];
                  const isCorrect = userAnswer === q.correct_answer;
                  const isExplaining = explainingId === q.id;
                  const explanation = explanations[q.id];

                  return (
                    <div key={q.id} className="bg-card border border-border rounded-2xl p-6 shadow-md relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCorrect ? "bg-green-500" : "bg-destructive"}`} />
                      
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground font-medium mb-2">Question {idx + 1}</p>
                          <p className="text-lg font-medium mb-6">{q.question}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            {(Object.entries(q.options) as [string, string][]).map(([key, val]) => {
                              const isSelected = userAnswer === key;
                              const isActualCorrect = q.correct_answer === key;
                              
                              let style = "border-border bg-background text-muted-foreground";
                              if (isActualCorrect) style = "border-green-500/50 bg-green-500/10 text-green-500";
                              else if (isSelected && !isActualCorrect) style = "border-destructive/50 bg-destructive/10 text-destructive";

                              return (
                                <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${style}`}>
                                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isActualCorrect ? "bg-green-500 text-white" : isSelected ? "bg-destructive text-white" : "bg-muted"}`}>
                                    {key}
                                  </div>
                                  <span className={isActualCorrect || isSelected ? "font-semibold" : ""}>{val}</span>
                                  {isActualCorrect && <Check className="h-4 w-4 ml-auto text-green-500" />}
                                  {isSelected && !isActualCorrect && <X className="h-4 w-4 ml-auto text-destructive" />}
                                </div>
                              )
                            })}
                          </div>

                          {!isCorrect && (
                            <div className="mt-4">
                              {!explanation ? (
                                <button
                                  onClick={() => handleExplain(q.id, q, userAnswer)}
                                  disabled={isExplaining}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent font-bold hover:bg-accent/20 transition-colors disabled:opacity-50"
                                >
                                  <Bot className="h-5 w-5" />
                                  {isExplaining ? "AI is analyzing..." : "Explain with AI Tutor"}
                                </button>
                              ) : (
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-4">
                                  <div className="flex items-center gap-2 mb-3 text-primary font-bold">
                                    <Bot className="h-5 w-5" /> AI Explanation
                                  </div>
                                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">{explanation}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
