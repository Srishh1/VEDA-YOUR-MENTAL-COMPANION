import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BreathingPhase = "idle" | "inhale" | "hold" | "exhale";

interface BreathingModeProps {
  isActive: boolean;
  onPhaseChange?: (phase: BreathingPhase) => void;
}

const PHASE_DURATIONS = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

const PHASE_LABELS = {
  inhale: "Inhale",
  hold: "Hold",
  exhale: "Exhale",
  idle: "",
};

export const BreathingMode = ({ isActive, onPhaseChange }: BreathingModeProps) => {
  const [phase, setPhase] = useState<BreathingPhase>("idle");
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);

  const updatePhase = useCallback((newPhase: BreathingPhase) => {
    setPhase(newPhase);
    onPhaseChange?.(newPhase);
  }, [onPhaseChange]);

  const startBreathingCycle = useCallback(() => {
    if (!isActive) return;
    updatePhase("inhale");
    setCountdown(PHASE_DURATIONS.inhale);
  }, [isActive, updatePhase]);

  useEffect(() => {
    if (isActive && phase === "idle") {
      startBreathingCycle();
    } else if (!isActive) {
      updatePhase("idle");
      setCountdown(0);
    }
  }, [isActive, phase, startBreathingCycle, updatePhase]);

  useEffect(() => {
    if (!isActive || phase === "idle") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (phase === "inhale") {
            updatePhase("hold");
            return PHASE_DURATIONS.hold;
          } else if (phase === "hold") {
            updatePhase("exhale");
            return PHASE_DURATIONS.exhale;
          } else if (phase === "exhale") {
            setCycles((c) => c + 1);
            updatePhase("inhale");
            return PHASE_DURATIONS.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, updatePhase]);

  return (
    <div className="relative flex flex-col items-center justify-center z-10">
      {/* Phase label and countdown - Large, thin silver typography */}
      <AnimatePresence mode="wait">
        {isActive && phase !== "idle" && (
          <motion.div
            className="flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            key={phase}
            style={{ minHeight: 200 }}
          >
            <motion.span
              className="text-2xl md:text-3xl font-light tracking-[0.4em] uppercase text-silver/70 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {PHASE_LABELS[phase]}
            </motion.span>
            <motion.span
              className="text-8xl md:text-9xl font-extralight text-silver"
              key={countdown}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{ 
                fontWeight: 200,
                textShadow: "0 0 60px hsl(213 30% 70% / 0.4), 0 0 120px hsl(213 30% 70% / 0.2)"
              }}
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cycle counter */}
      {isActive && cycles > 0 && (
        <motion.div
          className="absolute bottom-[-80px] text-sm text-muted-foreground/50 font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {cycles} cycle{cycles > 1 ? "s" : ""} completed
        </motion.div>
      )}
    </div>
  );
};
