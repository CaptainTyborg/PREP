import { useState, useEffect, useRef } from "react";
import { evaluate } from "mathjs";
import { Calculator as CalcIcon, X, GripHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Calculator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [display, setDisplay] = useState("0");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 300, dragRef.current.initialX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 400, dragRef.current.initialY + dy)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleInput = (val: string) => {
    setDisplay(prev => {
      if (prev === "0" || prev === "Error") return val;
      return prev + val;
    });
  };

  const handleCalculate = () => {
    try {
      const result = evaluate(display);
      setDisplay(String(Number(result.toPrecision(10))));
    } catch (error) {
      setDisplay("Error");
    }
  };

  const handleClear = () => setDisplay("0");
  
  const handleDelete = () => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{ left: position.x, top: position.y, position: "fixed", zIndex: 9999 }}
        className="w-72 bg-card border border-border shadow-2xl shadow-black/50 rounded-2xl overflow-hidden flex flex-col"
      >
        <div 
          className="bg-secondary p-3 flex justify-between items-center cursor-move border-b border-border/50 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <GripHorizontal className="h-4 w-4" />
            <span className="font-semibold text-sm">Scientific Calc</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div className="bg-background border border-border/50 rounded-xl p-3 text-right font-mono text-2xl h-14 overflow-hidden flex items-center justify-end text-accent">
            {display}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {/* Scientific row */}
            <CalcBtn onClick={() => handleInput("sin(")} label="sin" variant="secondary" />
            <CalcBtn onClick={() => handleInput("cos(")} label="cos" variant="secondary" />
            <CalcBtn onClick={() => handleInput("tan(")} label="tan" variant="secondary" />
            <CalcBtn onClick={() => handleInput("^")} label="^" variant="secondary" />
            
            {/* Main Pad */}
            <CalcBtn onClick={handleClear} label="AC" variant="destructive" />
            <CalcBtn onClick={handleDelete} label="DEL" variant="destructive" />
            <CalcBtn onClick={() => handleInput("(")} label="(" variant="secondary" />
            <CalcBtn onClick={() => handleInput(")")} label=")" variant="secondary" />
            
            <CalcBtn onClick={() => handleInput("7")} label="7" />
            <CalcBtn onClick={() => handleInput("8")} label="8" />
            <CalcBtn onClick={() => handleInput("9")} label="9" />
            <CalcBtn onClick={() => handleInput("/")} label="÷" variant="primary" />

            <CalcBtn onClick={() => handleInput("4")} label="4" />
            <CalcBtn onClick={() => handleInput("5")} label="5" />
            <CalcBtn onClick={() => handleInput("6")} label="6" />
            <CalcBtn onClick={() => handleInput("*")} label="×" variant="primary" />

            <CalcBtn onClick={() => handleInput("1")} label="1" />
            <CalcBtn onClick={() => handleInput("2")} label="2" />
            <CalcBtn onClick={() => handleInput("3")} label="3" />
            <CalcBtn onClick={() => handleInput("-")} label="−" variant="primary" />

            <CalcBtn onClick={() => handleInput("0")} label="0" />
            <CalcBtn onClick={() => handleInput(".")} label="." />
            <CalcBtn onClick={handleCalculate} label="=" variant="accent" />
            <CalcBtn onClick={() => handleInput("+")} label="+" variant="primary" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CalcBtn({ onClick, label, variant = "default" }: { onClick: () => void, label: string, variant?: "default" | "primary" | "secondary" | "destructive" | "accent" }) {
  const variants = {
    default: "bg-secondary/50 hover:bg-secondary text-foreground",
    primary: "bg-primary/20 hover:bg-primary/40 text-primary-foreground",
    secondary: "bg-muted hover:bg-muted/80 text-muted-foreground",
    destructive: "bg-destructive/20 hover:bg-destructive/40 text-destructive-foreground",
    accent: "bg-accent hover:bg-accent/90 text-accent-foreground font-bold",
  };

  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-lg font-medium transition-colors active:scale-95 flex items-center justify-center ${variants[variant]}`}
    >
      {label}
    </button>
  );
}
