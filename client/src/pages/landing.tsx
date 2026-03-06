import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BrainCircuit, Timer, TrendingUp, Trophy } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center text-center px-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-4xl flex flex-col items-center"
        >
          <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-8 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Trophy className="mr-2 h-4 w-4" />
            2024 JAMB UTME Simulator
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
            Crush Your JAMB with <br className="hidden md:block"/>
            <span className="text-gradient">Ultimate Confidence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            Experience the most realistic CBT simulator. Get AI-powered explanations for every mistake, track your speed, and guarantee your admission into your dream university.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login" className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 text-lg">
              Start Practicing Free
            </Link>
            <a href="#features" className="px-8 py-4 rounded-xl font-bold bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-all duration-300 text-lg">
              Explore Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* Hero Image / Mockup */}
      <section className="w-full max-w-6xl px-4 pb-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-2xl border border-border/50 bg-card/50 p-2 md:p-4 backdrop-blur-sm shadow-2xl shadow-black/40"
        >
          {/* landing page realistic student taking exam */}
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop" 
            alt="Student taking online exam" 
            className="rounded-xl w-full h-auto object-cover max-h-[600px] border border-border/50 opacity-90"
          />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="w-full bg-secondary/30 py-24 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why use PREP.ng?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to score 300+ in one beautifully designed platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Timer className="h-10 w-10 text-primary" />}
              title="True Exam Environment"
              description="Our interface perfectly mimics the official JAMB CBT screen so you won't face any surprises on exam day."
            />
            <FeatureCard 
              icon={<BrainCircuit className="h-10 w-10 text-accent" />}
              title="AI-Powered Tutor"
              description="Don't just see what you failed. Our AI explains exactly why an answer is wrong, reinforcing your knowledge."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Advanced Analytics"
              description="Track your speed per subject, identify weak topics, and watch your predicted score grow over time."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card rounded-2xl p-8 border border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 group">
      <div className="mb-6 p-4 bg-background rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
