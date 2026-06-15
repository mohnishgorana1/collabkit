"use client";

import { motion } from "motion/react";

export default function BackgroundAura() {
  return (
    <div className="absolute top-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none flex justify-center opacity-60 dark:opacity-40">
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[15%] w-[600px] h-[500px] bg-[#0071E3]/20 blur-[120px] rounded-full mix-blend-normal"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[10%] right-[15%] w-[500px] h-[600px] bg-[#AF52DE]/15 blur-[140px] rounded-full mix-blend-normal"
      />
    </div>
  );
}