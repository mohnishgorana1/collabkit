"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import WorkspaceSetupTabs from "@/components/onboarding/WorkspaceSetupTabs";

export default function WorkspaceActionModal({ asSidebarItem = false }: { asSidebarItem?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {asSidebarItem ? (
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors z-10 group active:scale-[0.98] text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
        >
          <Plus size={18} className="transition-transform group-hover:scale-105 text-primary" />
          New Workspace
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground active:scale-[0.96] hover:brightness-110 px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_4px_14px_rgba(0,122,255,0.3)] dark:shadow-[0_4px_14px_rgba(10,132,255,0.2)] text-sm"
        >
          <Plus size={18} />
          Create / Join
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Glass Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-background/50 backdrop-blur-xl"
            />

            {/* Modal Card - Apple Spring Physics */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-card/80 backdrop-blur-2xl border border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] rounded-4xl p-6 md:p-8"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground transition-colors active:scale-90"
              >
                <X size={18} />
              </button>

              <div className="mb-8 text-center mt-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Workspace Setup</h2>
                <p className="text-muted-foreground text-sm mt-1.5">Start a new team or enter an invite code.</p>
              </div>

              <WorkspaceSetupTabs />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}