import { motion } from "framer-motion";
import { MessageCircle, Wind } from "lucide-react";

type Tab = "chat" | "breathe" | "about";

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const leftTabs = [
  { id: "chat" as Tab, icon: MessageCircle, label: "Chat" },
  { id: "breathe" as Tab, icon: Wind, label: "Breathe" },
];

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  return (
    <motion.nav
      className="fixed top-6 left-6 glass rounded-full px-2 py-2 z-50"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-1">
        {leftTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-full
                transition-all duration-300 ease-out
                ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"}
              `}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-accent/30 rounded-full"
                  layoutId="activeTab"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" strokeWidth={1.5} />
              <span className="text-sm font-light relative z-10 hidden md:block">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
};
