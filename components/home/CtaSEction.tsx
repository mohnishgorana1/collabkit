"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="w-full py-32 px-4 flex justify-center">
      {/* Container with a fixed gradient background to create depth */}
      <div className="relative max-w-4xl w-full rounded-[40px] border border-border bg-card p-16 md:p-24 flex flex-col items-center text-center overflow-hidden">
        
        {/* Subtle Gradient Glow (Behind the text) */}
        <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-gradient-to-br from-primary/5 to-transparent blur-3xl -z-0" />

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-foreground mb-6">
            Ready to <span className="text-primary">simplify?</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-md font-medium leading-relaxed">
            Join thousands of teams who have already ditched the clutter and reclaimed their focus.
          </p>

          <Link 
            href="/signup" 
            className="group inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started for Free 
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}