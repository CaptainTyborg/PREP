import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useExamStore } from "@/store/use-exam-store";
import { useCreateAttempt } from "@/hooks/use-cbt";
import { Calculator } from "@/components/calculator";
import { Calculator as CalcIcon, Flag, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CBTExam() {
  const [, setLocation] = useLocation();
  const exam = useExamStore();
  const submitMutation = useCreateAttempt();
  const [showCalc, setShowCalc] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Redirect if no active exam
  useEffect(() => {
    if (!exam.isActive) {
      setLocation("/dashboard");
    }
  }, [exam.isActive, setLocation]);

  // Timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      exam.tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside input/textarea
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      
      const key = e.key.toUpperCase();
      const currentQList = exam.questions[exam.currentSubject] || [];
      const q = currentQList[exam.currentQuestionIndex];
      if (!q) return;

      if (["A", "B", "C", "D"].includes(key)) {
        exam.setAnswer(q.id, key);
      } else if (e.key === "ArrowRight") {
        exam.nextQuestion();
      } else if (e.key === "ArrowLeft") {
        exam.prevQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exam]);

  // Auto-submit when time is up
  useEffect(() => {
    if (exam.timeRemaining === 0 && exam.isActive) {
      handleSubmit();
    }
  }, [exam.timeRemaining]);

  if (!exam.isActive) return null;

  const currentQuestions = exam.questions[exam.currentSubject] || [];
  const question = currentQuestions[exam.currentQuestionIndex];
  if (!question) return <div>Loading exam data...</div>;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = exam.timeRemaining < 300; // 5 mins

  const handleSubmit = () => {
    // Calculate naive score before sending to backend
    let score = 0;
    const subjectScores: Record<string, number> = {};
    
    exam.subjects.forEach(sub => {
      subjectScores[sub] = 0;
      exam.questions[sub]?.forEach(q => {
        if (exam.answers[q.id] === q.correct_answer) {
          subjectScores[sub] += 1;
          score += 1; // Assuming 1 point per Q for mock logic, backend should calculate properly but we send this schema
        }
      });
    });

    submitMutation.mutate({
      userId: 1, // Mocked user ID
      examType: exam.examType,
      subjects: exam.subjects,
      answers: exam.answers,
      score: score, // Assuming out of 400 total mapped later, we'll just send raw count here
      subjectScores: subjectScores,
      timeTaken: 7200 - exam.timeRemaining
    }, {
      onSuccess: (data) => {
        exam.endExam();
        setLocation(`/review/${data.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-none select-none">
      <Calculator isOpen={showCalc} onClose={() => setShowCalc(false)} />

      {/* Top Header */}
      <header className="bg-card border-b border-border h-16 px-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="font-display font-bold text-xl tracking-tight text-foreground">
            PREP<span className="text-primary">.ng</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-secondary text-sm">
            Candidate: <span className="font-bold text-accent">Mock Student</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setShowCalc(!showCalc)} className="hidden sm:flex gap-2">
            <CalcIcon className="h-4 w-4" /> Calculator
          </Button>

          <div className={`font-mono text-xl md:text-2xl font-bold px-4 py-1 rounded-lg border-2 flex items-center gap-2 ${isLowTime ? "bg-destructive/20 border-destructive text-destructive animate-pulse" : "bg-primary/10 border-primary/50 text-primary"}`}>
            {isLowTime && <AlertTriangle className="h-5 w-5" />}
            {formatTime(exam.timeRemaining)}
          </div>
          
          <Button variant="destructive" onClick={() => setShowSubmitConfirm(true)}>
            Submit
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Subject Tabs */}
          <div className="flex border-b border-border bg-card/50 overflow-x-auto no-scrollbar">
            {exam.subjects.map(sub => (
              <button
                key={sub}
                onClick={() => exam.setCurrentSubject(sub)}
                className={`px-6 py-4 font-semibold whitespace-nowrap border-b-2 transition-colors
                  ${exam.currentSubject === sub 
                    ? "border-primary text-primary bg-primary/5" 
                    : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Question Display */}
          <div className="flex-1 p-6 md:p-12 max-w-4xl w-full mx-auto flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold text-muted-foreground">Question {exam.currentQuestionIndex + 1} of {currentQuestions.length}</span>
              <button 
                onClick={() => exam.toggleFlag(question.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border
                  ${exam.flagged[question.id] 
                    ? "bg-accent/20 border-accent text-accent" 
                    : "bg-secondary border-border text-muted-foreground hover:bg-secondary/80"}`}
              >
                <Flag className={`h-4 w-4 ${exam.flagged[question.id] ? "fill-current" : ""}`} />
                Flag
              </button>
            </div>

            <div className="text-lg md:text-xl font-medium leading-relaxed mb-10 select-text">
              {question.question}
            </div>

            <div className="space-y-4 mb-auto">
              {(Object.entries(question.options) as [string, string][]).map(([key, value]) => (
                <label 
                  key={key}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${exam.answers[question.id] === key 
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(0,135,81,0.15)]" 
                      : "border-border bg-card hover:border-primary/40"}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors shrink-0
                    ${exam.answers[question.id] === key 
                      ? "border-primary bg-primary text-white" 
                      : "border-muted-foreground text-muted-foreground"}
                  `}>
                    {key}
                  </div>
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    className="hidden"
                    checked={exam.answers[question.id] === key}
                    onChange={() => exam.setAnswer(question.id, key)}
                  />
                  <span className="text-base md:text-lg select-text">{value}</span>
                </label>
              ))}
            </div>

            {/* Nav Footer */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-border/50">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={exam.prevQuestion} 
                disabled={exam.currentQuestionIndex === 0}
                className="gap-2 w-32"
              >
                <ChevronLeft className="h-5 w-5" /> Prev
              </Button>

              <div className="hidden sm:block text-sm text-muted-foreground">
                Tip: Use keyboard <kbd className="bg-secondary px-2 py-1 rounded border border-border">A</kbd> <kbd className="bg-secondary px-2 py-1 rounded border border-border">B</kbd> <kbd className="bg-secondary px-2 py-1 rounded border border-border">C</kbd> <kbd className="bg-secondary px-2 py-1 rounded border border-border">D</kbd> to select
              </div>

              <Button 
                variant="default" 
                size="lg" 
                onClick={exam.nextQuestion} 
                disabled={exam.currentQuestionIndex === currentQuestions.length - 1}
                className="gap-2 w-32"
              >
                Next <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar Grid */}
        <div className="w-full lg:w-80 bg-card border-t lg:border-t-0 lg:border-l border-border flex flex-col h-64 lg:h-auto overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/20">
            <h3 className="font-bold mb-3">{exam.currentSubject} Grid</h3>
            <div className="flex gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm" /> Answered</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 border border-border rounded-sm" /> Unanswered</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-accent rounded-sm" /> Flagged</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2">
              {currentQuestions.map((q, idx) => {
                const isAnswered = !!exam.answers[q.id];
                const isFlagged = exam.flagged[q.id];
                const isCurrent = exam.currentQuestionIndex === idx;

                let stateClass = "border-border text-foreground hover:border-primary/50"; // default unanswered
                if (isFlagged) stateClass = "bg-accent text-accent-foreground font-bold border-accent";
                else if (isAnswered) stateClass = "bg-primary text-primary-foreground font-bold border-primary";

                if (isCurrent) stateClass += " ring-2 ring-foreground ring-offset-2 ring-offset-card";

                return (
                  <button
                    key={q.id}
                    onClick={() => exam.setCurrentQuestion(idx)}
                    className={`aspect-square rounded-md border text-sm transition-all duration-200 flex items-center justify-center ${stateClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 border border-border shadow-2xl">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Submit Exam?</h2>
            <p className="text-center text-muted-foreground mb-6">
              You still have {formatTime(exam.timeRemaining)} remaining. Are you sure you want to submit and end the exam?
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowSubmitConfirm(false)}>
                Cancel, Return
              </Button>
              <Button variant="destructive" className="flex-1" disabled={submitMutation.isPending} onClick={handleSubmit}>
                {submitMutation.isPending ? "Submitting..." : "Yes, Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
