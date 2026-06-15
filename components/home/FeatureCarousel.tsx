"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MessageSquare, FileText, HardDrive, Hash } from "lucide-react";
import { TbLayoutKanban } from "react-icons/tb";

// 1. Updated Features Array with Preview UI Data
const features = [
  {
    title: "Channels",
    desc: "Organize by project, team, or casual topics.",
    color: "bg-[#0071E3]",
    icon: Hash,
    preview: (
      <div className="flex flex-col gap-2 w-full mt-4">
        <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 p-2 rounded-md"><div className="w-2 h-2 rounded-full bg-blue-500" /> <div className="w-20 h-2 bg-current opacity-20 rounded-full" /></div>
        <div className="flex items-center gap-2 p-2"><div className="w-2 h-2 rounded-full bg-gray-300" /> <div className="w-16 h-2 bg-current opacity-10 rounded-full" /></div>
      </div>
    )
  },
  {
    title: "Direct Messages",
    desc: "Quick 1-on-1 pings for fast decisions.",
    color: "bg-[#AF52DE]",
    icon: MessageSquare,
    preview: (
      <div className="flex flex-col gap-2 w-full mt-4 items-end">
        <div className="w-24 h-8 bg-purple-500/20 rounded-t-xl rounded-bl-xl p-2 text-[10px] text-purple-900 dark:text-purple-100">Hey! Got a sec?</div>
        <div className="w-16 h-6 bg-gray-200 dark:bg-zinc-800 rounded-t-xl rounded-br-xl p-2 text-[10px]">Sure!</div>
      </div>
    )
  },
  {
    title: "Task Boards",
    desc: "Kanban style tracking. Never lose a to-do.",
    color: "bg-[#FF9F0A]",
    icon: TbLayoutKanban,
    preview: (
      <div className="flex gap-2 w-full mt-4">
        <div className="flex-1 bg-white/50 dark:bg-black/20 p-2 rounded-md h-16 flex flex-col gap-1">
          <div className="w-full h-2 bg-orange-500/30 rounded-full"></div>
          <div className="w-full h-2 bg-gray-300 dark:bg-zinc-700 rounded-full"></div>
        </div>
      </div>
    )
  },
  {
    title: "Document Editor",
    desc: "Rich text with slash commands.",
    color: "bg-[#34C759]",
    icon: FileText,
    preview: (
      <div className="w-full mt-4 bg-white/50 dark:bg-black/20 p-3 rounded-md space-y-2">
        <div className="w-full h-3 bg-green-500/30 rounded-sm"></div>
        <div className="w-4/5 h-2 bg-gray-300 dark:bg-zinc-700 rounded-sm"></div>
        <div className="w-3/5 h-2 bg-gray-300 dark:bg-zinc-700 rounded-sm"></div>
      </div>
    )
  },
  {
    title: "File Storage",
    desc: "Drag, drop, and find anything instantly.",
    color: "bg-[#FF3B30]",
    icon: HardDrive,
    preview: (
      <div className="flex items-center gap-3 w-full mt-4 bg-white/50 dark:bg-black/20 p-3 rounded-md">
        <div className="w-8 h-8 rounded bg-red-500/20 flex items-center justify-center text-[10px] font-bold text-red-600">PDF</div>
        <div className="w-full h-2 bg-gray-300 dark:bg-zinc-700 rounded-full"></div>
      </div>
    )
  },
];
export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play the carousel every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  return (
    <section className="w-full py-32 z-10 overflow-hidden bg-background border-y border-border/50 relative">

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Left Side: Sticky Content */}
        <div className="flex flex-col gap-6 text-center lg:text-left z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Everything you need. <br className="hidden lg:block" />
              <span className="text-muted-foreground">Nothing you don't.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              We replaced 5 different subscriptions with one beautifully cohesive platform. Watch your team&apos;s velocity soar.
            </p>
          </motion.div>
        </div>

        {/* Right Side: 3D Animated Card Stack */}
        {/* 💡 Shrunk the container height and max-width */}
        <div className="relative w-full h-[340px] md:h-[380px] max-w-[300px] md:max-w-[320px] mx-auto perspective-[1000px]">
          {features.map((feature, index) => {
            const isFront = currentIndex === index;
            const isNext = (currentIndex + 1) % features.length === index;
            const isNextNext = (currentIndex + 2) % features.length === index;
            const isLeaving = (currentIndex - 1 + features.length) % features.length === index;

            let zIndex = 0;
            let x = 0;
            let y = 0;
            let scale = 1;
            let opacity = 0;
            let rotateZ = 0;

            if (isFront) {
              zIndex = 30; y = 0; scale = 1; opacity = 1; x = 0; rotateZ = 0;
            } else if (isNext) {
              zIndex = 20; y = 25; scale = 0.95; opacity = 0.8; x = 0; rotateZ = 0;
            } else if (isNextNext) {
              zIndex = 10; y = 50; scale = 0.9; opacity = 0.4; x = 0; rotateZ = 0;
            } else if (isLeaving) {
              // Swoops UP and RIGHT
              zIndex = 40; y = -60; scale = 1.05; opacity = 0; x = 120; rotateZ = 12;
            } else {
              zIndex = 0; y = 70; scale = 0.85; opacity = 0; x = 0; rotateZ = 0;
            }

            return (
              // card
              <motion.div
                key={feature.title}
                initial={false}
                animate={{ zIndex, x, y, scale, opacity, rotateZ }}
                transition={{ type: "spring", stiffness: 200, damping: 22, mass: 1 }}
                onClick={handleNext}
                className="absolute inset-x-0 top-0 mx-auto aspect-[4/5] w-[95%] md:w-full apple-glass rounded-[28px] p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-2xl cursor-pointer group hover:border-border transition-colors"
              >
                <div className={`absolute top-[-10%] right-[-10%] w-40 h-40 ${feature.color} rounded-full blur-[70px] opacity-10 dark:opacity-20`} />

                {/* Icon at top */}
                <div className={`w-12 h-12 rounded-[14px] ${feature.color} flex items-center justify-center text-white mb-auto shadow-md border border-white/20 transform group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon size={20} strokeWidth={2} />
                </div>

                {/* 💡 Preview UI Component added here */}
                {feature.preview}

                <motion.div
                  animate={{ opacity: isFront ? 1 : 0.3 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <h3 className="text-xl font-bold tracking-tight mb-1.5 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">{feature.desc}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}