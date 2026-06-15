"use client";

import { motion } from "motion/react";
import { MessageSquare, Zap, FileText } from "lucide-react";
import { TbLayoutKanban } from "react-icons/tb";

export default function BentoGrid() {
  const springUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { type: "spring", stiffness: 100, damping: 20, mass: 1 }
  };

  // Base 3D isometric perspective
  const isoContainer = {
    transform: "rotateX(55deg) rotateZ(-45deg)",
    transformStyle: "preserve-3d" as const,
  };

  // Common card styling for clean outer borders and rich dark mode bg
  const cardStyle = "relative flex flex-col overflow-hidden rounded-[32px] bg-white/70 dark:bg-zinc-900/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out group/card cursor-default p-8 md:p-10";
  
  // Interactive shift logic: Dim others, pop the hovered one
  const shiftLogic = "group-hover/grid:opacity-50 group-hover/grid:scale-[0.98] hover:!opacity-100 hover:!scale-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:bg-zinc-800/90 dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 z-10 hover:z-20";

  return (
    <section id="features" className="w-full max-w-6xl mx-auto px-4 mb-32 z-10 pt-16">
      
      {/* Header */}
      <motion.div {...springUp} className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground dark:text-zinc-50 mb-4">
          The ultimate team toolkit.
        </h2>
        <p className="text-muted-foreground dark:text-zinc-400 text-lg max-w-xl mx-auto font-medium">
          Everything your team needs, structured perfectly. Instantly familiar, yet remarkably faster.
        </p>
      </motion.div>

      {/* 🌟 ENTIRE GRID WRAPPER (Controls the Shift Effect) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-auto md:h-[650px] group/grid">
        
        {/* ==================================================== */}
        {/* CARD 1: CONTEXTUAL CHAT (Span 2) */}
        {/* ==================================================== */}
        <motion.div {...springUp} className={`md:col-span-2 ${cardStyle} ${shiftLogic}`}>
          <div className="relative z-10 max-w-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#0071E3] text-white shadow-[0_4px_12px_rgba(0,113,227,0.4)] flex items-center justify-center mb-6">
              <MessageSquare size={22} fill="currentColor" className="opacity-90" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-3">Contextual Chat</h3>
            <p className="text-muted-foreground dark:text-zinc-400 text-[15px] leading-relaxed font-medium">
              Threads that finally make sense. Select any message and convert it into a tracked task instantly without losing context.
            </p>
          </div>
          
          {/* ISOMETRIC ILLUSTRATION: Dynamic Chat Bubbles */}
          <div className="absolute right-[-10%] top-[10%] w-[60%] h-full pointer-events-none [mask-image:linear-gradient(to_left,white_20%,transparent_100%)] flex items-center justify-center">
            {/* The wrapper shifts UP and SCALES on card hover */}
            <div style={isoContainer} className="relative w-48 h-48 group-hover/card:scale-125 group-hover/card:-translate-y-8 group-hover/card:-translate-x-4 transition-transform duration-700 ease-out">
              
              <motion.div 
                animate={{ z: [10, 20, 10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-40 h-20 bg-white dark:bg-zinc-800 shadow-xl rounded-2xl p-4 flex flex-col gap-2.5"
              >
                <div className="w-1/2 h-2 bg-black/10 dark:bg-white/10 rounded-full"></div>
                <div className="w-3/4 h-2 bg-black/10 dark:bg-white/10 rounded-full"></div>
              </motion.div>

              <motion.div 
                animate={{ z: [50, 65, 50] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-0 left-0 w-32 h-16 bg-[#0071E3] shadow-[0_20px_40px_rgba(0,113,227,0.4)] rounded-2xl p-4 flex flex-col gap-2.5"
              >
                <div className="w-full h-2 bg-white/40 rounded-full"></div>
                <div className="w-2/3 h-2 bg-white/40 rounded-full"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ==================================================== */}
        {/* CARD 2: TASK BOARDS (Span 1) */}
        {/* ==================================================== */}
        <motion.div {...springUp} className={`md:col-span-1 ${cardStyle} ${shiftLogic}`}>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#FF9F0A] text-white shadow-[0_4px_12px_rgba(255,159,10,0.4)] flex items-center justify-center mb-6">
              <TbLayoutKanban size={24} className="opacity-90" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-3">Fluid Kanban</h3>
            <p className="text-muted-foreground dark:text-zinc-400 text-sm font-medium">Drag, drop, and conquer. Manage workflows with buttery smooth task boards.</p>
          </div>

          {/* ISOMETRIC ILLUSTRATION: Kanban Columns */}
          <div className="absolute bottom-[-10%] right-[-20%] w-[120%] h-[60%] pointer-events-none [mask-image:linear-gradient(to_top,white_40%,transparent_100%)] flex items-end justify-center">
             {/* Shifts UP and pops out on hover */}
             <div style={isoContainer} className="relative w-full h-40 group-hover/card:scale-110 group-hover/card:-translate-y-8 group-hover/card:translate-x-4 transition-transform duration-700 ease-out flex gap-3 pt-10">
               <div className="w-12 h-32 bg-white/80 dark:bg-zinc-800/80 shadow-2xl rounded-xl p-1.5 flex flex-col gap-1.5" style={{ transform: "translateZ(20px)" }}>
                 <div className="w-full h-8 bg-[#FF9F0A]/80 rounded-lg shadow-sm"></div>
                 <div className="w-full h-12 bg-black/5 dark:bg-white/5 rounded-lg"></div>
               </div>
               <div className="w-12 h-40 bg-white/80 dark:bg-zinc-800/80 shadow-2xl rounded-xl p-1.5 flex flex-col gap-1.5" style={{ transform: "translateZ(40px)" }}>
                 <div className="w-full h-10 bg-black/5 dark:bg-white/5 rounded-lg"></div>
                 <div className="w-full h-16 bg-[#0071E3]/80 rounded-lg shadow-lg shadow-[#0071E3]/40"></div>
               </div>
             </div>
          </div>
        </motion.div>

        {/* ==================================================== */}
        {/* CARD 3: LIGHTNING FAST (Span 1) */}
        {/* ==================================================== */}
        <motion.div {...springUp} className={`md:col-span-1 ${cardStyle} ${shiftLogic}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#34C759]/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#34C759] text-white shadow-[0_4px_12px_rgba(52,199,89,0.4)] flex items-center justify-center mb-6">
              <Zap size={22} fill="currentColor" className="opacity-90" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-3">Zero Latency</h3>
            <p className="text-muted-foreground dark:text-zinc-400 text-sm font-medium">Built on modern edge infrastructure. Syncs faster than you can blink.</p>
          </div>

          {/* ISOMETRIC ILLUSTRATION: Glowing Speed Rings */}
          <div className="absolute bottom-[-10%] right-[-10%] w-full h-[60%] pointer-events-none flex items-center justify-center">
            {/* Shifts and rotates further on hover */}
            <div style={isoContainer} className="relative w-32 h-32 group-hover/card:scale-125 group-hover/card:-translate-y-4 group-hover/card:rotate-z-[-10deg] transition-transform duration-700 ease-out">
              <motion.div animate={{ z: [0, 40, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 border-4 border-[#34C759]/30 dark:border-[#34C759]/50 rounded-full shadow-[0_0_30px_rgba(52,199,89,0.3)]"></motion.div>
              <motion.div animate={{ z: [20, -20, 20] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute inset-4 border-4 border-[#34C759]/50 dark:border-[#34C759]/80 rounded-full shadow-[0_0_30px_rgba(52,199,89,0.5)]"></motion.div>
              <div className="absolute inset-8 bg-[#34C759] rounded-full shadow-[0_0_50px_rgba(52,199,89,0.8)]" style={{ transform: "translateZ(20px)" }}></div>
            </div>
          </div>
        </motion.div>

        {/* ==================================================== */}
        {/* CARD 4: MULTIPLAYER DOCS (Span 2) */}
        {/* ==================================================== */}
        <motion.div {...springUp} className={`md:col-span-2 md:flex-row items-center justify-between ${cardStyle} ${shiftLogic}`}>
          <div className="relative z-10 max-w-xs mb-8 md:mb-0">
            <div className="w-12 h-12 rounded-2xl bg-[#AF52DE] text-white shadow-[0_4px_12px_rgba(175,82,222,0.4)] flex items-center justify-center mb-6">
              <FileText size={22} fill="currentColor" className="opacity-90" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground dark:text-zinc-100 mb-3">Multiplayer Docs</h3>
            <p className="text-muted-foreground dark:text-zinc-400 text-[15px] leading-relaxed font-medium">
              Write specs and brainstorm together. A beautifully minimal, real-time collaborative editor that stays out of your way.
            </p>
          </div>

          {/* ISOMETRIC ILLUSTRATION: Stacked Document Sheets */}
          <div className="absolute right-[-5%] md:right-[5%] top-1/2 -translate-y-1/2 w-[200px] h-[200px] pointer-events-none flex items-center justify-center">
            {/* Shifts left and scales up on hover */}
            <div style={isoContainer} className="relative w-32 h-40 group-hover/card:scale-125 group-hover/card:-translate-x-6 transition-transform duration-700 ease-out">
              
              {/* Bottom Sheet */}
              <div className="absolute inset-0 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-xl shadow-lg" style={{ transform: "translateZ(0px)" }}></div>
              
              {/* Middle Sheet */}
              <motion.div animate={{ z: [10, 20, 10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-xl shadow-xl p-3 flex flex-col gap-2.5">
                <div className="w-1/2 h-2 bg-[#AF52DE]/40 rounded-full"></div>
                <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full"></div>
                <div className="w-5/6 h-1.5 bg-black/10 dark:bg-white/10 rounded-full"></div>
              </motion.div>
              
              {/* Top Sheet (Active) */}
              <motion.div animate={{ z: [30, 50, 30] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute inset-[-10px] bg-white dark:bg-zinc-900 rounded-xl shadow-[0_20px_40px_rgba(175,82,222,0.3)] p-4 flex flex-col gap-2.5">
                <div className="flex gap-2 items-center mb-2">
                   <div className="w-4 h-4 rounded-full bg-[#AF52DE] shadow-[0_0_10px_rgba(175,82,222,0.6)]"></div>
                   <div className="w-16 h-2 bg-[#AF52DE]/30 rounded-full"></div>
                </div>
                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full"></div>
                <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full"></div>
                <div className="w-2/3 h-2 bg-black/10 dark:bg-white/10 rounded-full"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}