"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function VerticalTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook into the scroll position of the timeline container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"], // Starts drawing when top hits center, finishes when bottom hits center
  });

  // Transform the scroll progress (0 to 1) into a percentage for the line's height
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const springUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { type: "spring", stiffness: 150, damping: 20, mass: 1 }
  };

  const steps = [
    { step: "01", title: "Create a Workspace", desc: "No credit card required. Pick a name and instantly generate a secure instance.", align: "right" },
    { step: "02", title: "Share Invite Code", desc: "Copy your unique 8-digit identifier. Only people with this code can enter.", align: "left" },
    { step: "03", title: "Start Collaborating", desc: "Open channels, build tasks, and watch your team align in real-time.", align: "right" }
  ];

  return (
    <section className="w-full py-24 max-w-4xl mx-auto px-4 z-10">
      <motion.div {...springUp} className="mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Setup in seconds.</h2>
        <p className="text-muted-foreground text-lg">Skip the manual, jump straight into action.</p>
      </motion.div>

      {/* Attach ref here to track scroll progress over this area */}
      <div ref={containerRef} className="relative pl-6 md:pl-0">
        
        {/* 1. Static Background Line (The empty track) */}
        <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-px bg-border/60 -translate-x-1/2 z-0"></div>

        {/* 2. Animated Glowing Foreground Line (The energy beam) */}
        <motion.div 
          className="absolute left-6 md:left-1/2 top-4 w-[2px] bg-gradient-to-b from-primary via-primary/80 to-transparent -translate-x-1/2 z-0 origin-top shadow-[0_0_12px_rgba(0,113,227,0.6)] dark:shadow-[0_0_12px_rgba(10,132,255,0.6)] rounded-full"
          style={{ height: lineHeight }}
        />

        {steps.map((s, i) => (
          <div key={i} className={`relative z-10 flex flex-col md:flex-row items-start md:items-center w-full mb-16 last:mb-0 ${s.align === 'left' ? 'md:flex-row-reverse' : ''}`}>
            
            {/* Center Node (Spring Animation) */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="absolute left-0 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-4 border-primary flex items-center justify-center z-20 shadow-[0_0_0_4px_rgba(0,113,227,0.1)] dark:shadow-[0_0_0_4px_rgba(10,132,255,0.1)] transition-colors duration-300"
            />

            {/* Content Card */}
            <div className={`w-full md:w-1/2 pt-2 md:pt-0 ${s.align === 'left' ? 'md:pr-16 md:text-right text-left pl-10 md:pl-0' : 'md:pl-16 text-left pl-10'}`}>
              <motion.div 
                initial={{ opacity: 0, x: s.align === 'left' ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="apple-glass p-6 md:p-8 rounded-3xl group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1"
              >
                <span className="text-primary font-mono text-sm font-bold tracking-widest mb-2 block">STEP {s.step}</span>
                <h3 className="text-2xl font-bold tracking-tight mb-2">{s.title}</h3>
                <p className="text-muted-foreground font-medium">{s.desc}</p>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}