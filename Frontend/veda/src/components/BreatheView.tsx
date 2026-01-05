import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BioluminescentPulse } from "./BioluminescentPulse";
import { Play, Pause } from "lucide-react";
import { BreathingMode } from "./BreathingMode";

type BreathingPhase = "idle" | "inhale" | "hold" | "exhale";

export const BreatheView = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>("idle");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] pt-16">
      <AnimatePresence mode="wait">
        {!isActive ? (
          // Inactive state - show pulse centered
          <motion.div
            key="inactive"
            className="flex flex-col items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-light text-silver tracking-wide mb-2">
                Breathe with Veda
              </h2>
              <p className="text-sm text-muted-foreground/60 font-light">
                4-7-8 breathing technique
              </p>
            </motion.div>

            <BioluminescentPulse breathingPhase="idle" size="medium" />

            <motion.button
              onClick={() => setIsActive(true)}
              className="glass px-8 py-3 rounded-full flex items-center gap-3 text-foreground/80 hover:text-foreground transition-colors duration-300 mt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Play className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-light tracking-wide">Begin</span>
            </motion.button>
          </motion.div>
        ) : (
          // Active state - breathing mode with pulse as guide
          <motion.div
            key="active"
            className="flex flex-col items-center justify-center w-full h-full relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Main breathing pulse - becomes the guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <BioluminescentPulse 
                breathingPhase={currentPhase} 
                size="large" 
                isBackground={false}
                opacity={0.9}
              />
            </div>

            {/* Countdown overlay inside the pulse */}
            <BreathingMode 
              isActive={isActive} 
              onPhaseChange={setCurrentPhase}
            />

            <motion.button
              onClick={() => {
                setIsActive(false);
                setCurrentPhase("idle");
              }}
              className="glass px-8 py-3 rounded-full flex items-center gap-3 text-foreground/80 hover:text-foreground transition-colors duration-300 mt-12 relative z-10"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Pause className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-light tracking-wide">Pause</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};