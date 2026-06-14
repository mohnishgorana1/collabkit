// /app/page.tsx
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { MessageSquare, CheckCircle, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      
      {/* HERO SECTION */}
      <section className="w-full py-24 md:py-32 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium mb-6 bg-secondary/50 text-secondary-foreground"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          CollabKit 1.0 is now live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6"
        >
          Where conversations turn into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">action.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
        >
          Bundle your team's chat, task boards, and lightweight docs into a single, blazing-fast workspace. Stop juggling tabs and start building.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link 
            href="/signup" 
            className="flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-8 py-3.5 rounded-full font-medium transition-all hover:scale-105"
          >
            Start Workspace <ArrowRight size={18} />
          </Link>
          <Link 
            href="#features" 
            className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-8 py-3.5 rounded-full font-medium transition-all"
          >
            Explore Features
          </Link>
        </motion.div>
      </section>

      {/* DASHBOARD PREVIEW MOCKUP */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="w-full max-w-5xl px-4 mb-24"
      >
        <div className="w-full aspect-[16/9] rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
          {/* Mockup Header */}
          <div className="h-12 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="mx-auto w-1/3 h-5 rounded bg-background border border-border"></div>
          </div>
          {/* Mockup Body */}
          <div className="flex-1 flex bg-background/50">
            <div className="w-48 border-r border-border hidden md:block bg-muted/10 p-4">
               <div className="w-full h-4 bg-muted rounded mb-3"></div>
               <div className="w-2/3 h-4 bg-muted rounded mb-3"></div>
               <div className="w-3/4 h-4 bg-muted rounded mb-8"></div>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-4">
               <div className="w-1/3 h-6 bg-muted rounded"></div>
               <div className="w-full h-32 border border-border border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                 App Workspace Preview
               </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FEATURES SECTION */}
      <section id="features" className="w-full max-w-6xl mx-auto px-4 py-24 border-t border-border/50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need, nothing you don't.</h2>
          <p className="text-muted-foreground text-lg">A unified toolkit designed for speed and clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Real-time Chat</h3>
            <p className="text-muted-foreground leading-relaxed">
              Communicate instantly with your team. Turn any message into an actionable task with a single click.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Connected Tasks</h3>
            <p className="text-muted-foreground leading-relaxed">
              Track progress effortlessly. Tasks are directly linked to the conversations and docs that spawned them.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl border border-border bg-card/50 hover:bg-card transition-colors">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Multiplayer Docs</h3>
            <p className="text-muted-foreground leading-relaxed">
              Write specs and notes together. Built-in real-time collaboration so you never have to ask "who has the latest version?".
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}