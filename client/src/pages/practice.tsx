import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-auth";
import { useGenerateQuestions } from "@/hooks/use-cbt";
import { useExamStore } from "@/store/use-exam-store";
import { BookOpen, CheckCircle2, Play } from "lucide-react";

const AVAILABLE_SUBJECTS = [
  "Use of English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Literature in English",
  "Government",
  "Economics",
  "Geography",
  "Agricultural Science",
  "Civic Education",
  "Christian Religious Studies",
  "Islamic Studies"
];

export default function PracticeSetup() {
  const { data: user, isLoading: userLoading } = useUser();
  const [, setLocation] = useLocation();
  const generateMutation = useGenerateQuestions();
  const startExam = useExamStore(state => state.startExam);
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["Use of English"]);

  if (userLoading) return null;
  if (!user) {
    setLocation("/login");
    return null;
  }

  const toggleSubject = (sub: string) => {
    if (sub === "Use of English") return; // Mandatory
    setSelectedSubjects(prev => {
      if (prev.includes(sub)) return prev.filter(s => s !== sub);
      if (prev.length < 4) return [...prev, sub];
      return prev;
    });
  };

  const handleStart = async () => {
    if (selectedSubjects.length !== 4) return;
    
    generateMutation.mutate({ subjects: selectedSubjects }, {
      onSuccess: (data) => {
        // Mock JAMB uses 120 minutes (7200 seconds)
        startExam("mock", selectedSubjects, data, 7200);
        setLocation("/cbt");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Configure Your Exam</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          JAMB requires Use of English and 3 other subjects. Select your subjects below to generate a realistic mock exam.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 md:p-10">
        <div className="flex justify-between items-end mb-6 border-b border-border/50 pb-4">
          <div>
            <h3 className="text-xl font-bold">Select Subjects</h3>
            <p className="text-sm text-muted-foreground mt-1">{selectedSubjects.length} / 4 Selected</p>
          </div>
          {selectedSubjects.length === 4 && (
            <span className="text-accent font-medium text-sm flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Ready
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
          {AVAILABLE_SUBJECTS.map(sub => {
            const isSelected = selectedSubjects.includes(sub);
            const isMandatory = sub === "Use of English";
            return (
              <button
                key={sub}
                onClick={() => toggleSubject(sub)}
                disabled={isMandatory}
                className={`
                  p-4 rounded-xl text-left transition-all duration-200 border-2
                  ${isSelected 
                    ? "border-primary bg-primary/10 text-primary-foreground shadow-md shadow-primary/10" 
                    : "border-border bg-background hover:border-primary/50 text-muted-foreground"
                  }
                  ${isMandatory ? "cursor-not-allowed opacity-80" : "cursor-pointer active:scale-95"}
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className={`h-4 w-4 rounded-full border ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  {isMandatory && <span className="text-[10px] uppercase font-bold text-accent">Required</span>}
                </div>
                <span className={`font-semibold ${isSelected ? "text-foreground" : ""}`}>{sub}</span>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleStart}
            disabled={selectedSubjects.length !== 4 || generateMutation.isPending}
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
          >
            {generateMutation.isPending ? "Generating Papers..." : (
              <>
                <Play className="h-5 w-5 fill-current" />
                Start CBT Session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
