"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="w-full pt-22 pb-10 md:pb-16 flex flex-col items-center text-center px-4 max-w-5xl mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="inline-flex items-center rounded-full border border-border/80 px-4 py-1.5 text-xs font-semibold mb-6 apple-glass text-muted-foreground"
      >
        <Sparkles size={14} className="mr-2 text-primary" />
        CollabKit 2.0 is out of beta
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.05 }}
        className="text-5xl md:text-[84px] font-bold tracking-tight text-foreground mb-6 leading-[1.05]"
      >
        Think clearly. <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground/30">Build instantly.</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl font-medium leading-relaxed"
      >
        Stop losing context across a dozen apps. CollabKit brings your team's chat, tasks, and notes into a single, beautifully crafted environment.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
      >
        <Link href="/signup" className="group flex items-center justify-center gap-2 bg-primary text-primary-foreground active:scale-[0.98] px-8 py-3.5 rounded-full text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,113,227,0.3)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.4)]">
          Start building <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="#features" className="flex items-center justify-center gap-2 apple-glass hover:bg-secondary/60 active:scale-[0.98] px-8 py-3.5 rounded-full text-[15px] font-semibold transition-all">
          Explore Features
        </Link>
      </motion.div>
    </section>
  );
}