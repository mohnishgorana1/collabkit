"use client";

import { motion } from "motion/react";
import { Command } from "lucide-react";

export default function MacOsMockup() {
  const springUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { type: "spring", stiffness: 150, damping: 20, mass: 1 }
  };

  return (
    <motion.section {...springUp} className="w-full max-w-6xl px-4 relative z-10">
      <div className="w-full aspect-[16/10] md:aspect-[16/8] apple-glass rounded-[24px] md:rounded-t-[32px] md:rounded-b-none overflow-hidden flex flex-col relative border border-white/40 dark:border-white/10 [mask-image:linear-gradient(to_bottom,white_60%,transparent_100%)]">
        
        <div className="h-12 border-b border-border/50 flex items-center px-4 gap-2 bg-gradient-to-b from-background/40 to-background/10">
          <div className="flex gap-1.5 ml-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm border border-black/10"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm border border-black/10"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm border border-black/10"></div>
          </div>
          <div className="mx-auto flex items-center justify-center w-56 h-6 rounded-md bg-background/50 border border-border/50 text-[11px] text-muted-foreground font-medium shadow-sm backdrop-blur-md">
            <Command size={10} className="mr-1.5 opacity-50" /> collabkit.app
          </div>
        </div>
        
        <div className="flex-1 flex bg-background/40 p-6 gap-6">
          <div className="w-56 hidden md:flex flex-col gap-4">
             <div className="w-full h-8 bg-muted-foreground/10 rounded-lg"></div>
             <div className="w-2/3 h-4 bg-muted-foreground/10 rounded-md mt-4"></div>
             <div className="w-3/4 h-4 bg-muted-foreground/10 rounded-md"></div>
             <div className="w-1/2 h-4 bg-muted-foreground/10 rounded-md"></div>
          </div>
          <div className="flex-1 flex flex-col gap-4">
             <div className="w-full h-32 bg-secondary/50 rounded-2xl border border-border/50"></div>
             <div className="flex gap-4">
               <div className="w-1/2 h-40 bg-secondary/50 rounded-2xl border border-border/50"></div>
               <div className="w-1/2 h-40 bg-secondary/50 rounded-2xl border border-border/50"></div>
             </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}