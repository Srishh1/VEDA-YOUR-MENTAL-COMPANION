import { motion } from "framer-motion";
import { X, Info } from "lucide-react";

type Tab = "chat" | "breathe" | "about";

interface TopRightMenuProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const TopRightMenu = ({ activeTab, onTabChange }: TopRightMenuProps) => {
  const handleEscape = () => {
    window.location.href = "https://www.google.com/search?q=google.com";
  };

  const isAboutActive = activeTab === "about";

  return (
    <motion.div
      className="fixed top-6 right-6 flex items-center gap-2 z-50"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
    >
      {/* About Button */}
      <button
        onClick={() => onTabChange("about")}
        className={`
          glass rounded-full px-4 py-2.5 flex items-center gap-2
          transition-all duration-300 ease-out
          ${isAboutActive ? "text-foreground bg-accent/30" : "text-muted-foreground hover:text-foreground/80"}
        `}
      >
        <Info className="w-4 h-4" strokeWidth={1.5} />
        <span className="text-sm font-light hidden md:block">About</span>
      </button>

      {/* Exit Button */}
      <motion.button
        onClick={handleEscape}
        className="glass rounded-full p-3 text-muted-foreground/60 hover:text-foreground/80 transition-colors duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Quick Exit"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </motion.button>
    </motion.div>
  );
};
