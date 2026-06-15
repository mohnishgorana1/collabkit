"use client";

export default function LogoMarquee() {
  const logos = ["ACME Corp", "GLOBEX", "Stark Ind.", "SOYLENT", "WAYNE ENT.", "UMBRELLA"];

  return (
    <section className="w-full py-20 overflow-hidden bg-background">
      
      {/* 💡 Custom CSS for seamless infinite scroll and pausing */}
      <style>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-slide {
          animation: slide 25s linear infinite;
        }
      `}</style>

      <p className="text-[12px] font-bold text-center text-muted-foreground/70 mb-10 uppercase tracking-[0.2em]">
        Powering next-gen teams
      </p>
      
      {/* group/marquee is used to detect hover over the entire scrolling area */}
      <div className="relative w-full max-w-5xl mx-auto flex overflow-hidden mask-[linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] group/marquee">
        
        {/* The scrolling track. Pauses when the group is hovered. */}
        <div className="flex gap-16 md:gap-24 pr-16 md:pr-24 min-w-max items-center animate-slide group-hover/marquee:[animation-play-state:paused]">
          
          {/* Render list twice for seamless looping */}
          {[...logos, ...logos].map((logo, i) => (
            <div 
              key={i} 
              className="text-xl md:text-2xl font-bold tracking-tight shrink-0 transition-all duration-500 cursor-pointer text-muted-foreground/60
                         /* When the marquee is hovered, dim all logos, scale down slightly, and add a soft blur */
                         group-hover/marquee:opacity-50 group-hover/marquee:blur-[2px] group-hover/marquee:scale-95
                         /* When THIS specific logo is hovered, make it pop, remove blur, and brighten it! */
                         hover:opacity-100! hover:blur-none! hover:scale-110! hover:text-foreground hover:drop-shadow-lg"
            >
              {logo}
            </div>
          ))}
          
        </div>
      </div>
    </section>
  );
}