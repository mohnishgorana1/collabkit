"use client";

import { useState } from "react";
import { Building2, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CreateWorkspaceForm from "@/components/workspace/CreateWorkspaceForm";
import JoinWorkspace from "@/components/workspace/JoinWorkspace";

export default function WorkspaceSetupTabs() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  return (
    <div className="w-full">
      {/* Authentic iOS Segmented Control */}
      <div className="flex p-1 mb-8 bg-secondary/80 rounded-xl relative">
        <button
          onClick={() => setActiveTab("create")}
          className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-[10px] transition-colors z-10 ${
            activeTab === "create" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {activeTab === "create" && (
            <motion.div 
              layoutId="ios-segment-bg" 
              className="absolute inset-0 bg-background rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-black/5 dark:border-white/5" 
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2"><Building2 size={16} /> Create</span>
        </button>
        
        <button
          onClick={() => setActiveTab("join")}
          className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-[10px] transition-colors z-10 ${
            activeTab === "join" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {activeTab === "join" && (
            <motion.div 
              layoutId="ios-segment-bg" 
              className="absolute inset-0 bg-background rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-black/5 dark:border-white/5" 
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2"><LinkIcon size={16} /> Join</span>
        </button>
      </div>

      {/* Forms Area - Slide animation without lag */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "create" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === "create" ? 20 : -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-full"
          >
            {activeTab === "create" ? (
              <CreateWorkspaceForm />
            ) : (
              <div className="text-center pt-2">
                <JoinWorkspace showInput={true} redirectUrl="/dashboard" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}