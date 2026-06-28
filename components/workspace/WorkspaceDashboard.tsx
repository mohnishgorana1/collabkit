"use client";

import React from 'react';
import { Sparkles, Activity, CheckCircle2, Clock, Users, ArrowRight, Hash, SquareKanban, FileText, Layers, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function WorkspaceDashboard({ workspace, channels = [] }: { workspace: any, channels?: any[] }) {
  
  // Channels ke liye vibrant aur modern icons
  const getChannelConfig = (type: string) => {
    if (type === "CHAT") return { icon: <Hash size={18} className="text-blue-500" />, bg: "bg-blue-500/10", border: "group-hover:border-blue-500/30" };
    if (type === "TASKS") return { icon: <SquareKanban size={18} className="text-amber-500" />, bg: "bg-amber-500/10", border: "group-hover:border-amber-500/30" };
    if (type === "DOCS") return { icon: <FileText size={18} className="text-emerald-500" />, bg: "bg-emerald-500/10", border: "group-hover:border-emerald-500/30" };
    return { icon: <Hash size={18} className="text-muted-foreground" />, bg: "bg-secondary", border: "group-hover:border-border" };
  };

  // Animation variants for staggered load
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full overflow-y-auto custom-thin-scrollbar relative">
      
      {/* 🌟 Premium Immersive Banner */}
      <div className="relative h-56 sm:h-64 bg-card border-b border-border/60 shrink-0 overflow-hidden flex flex-col justify-end">
        {/* Animated Gradient Orbs & Pattern */}
        <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-60 mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-5%] w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] opacity-60 mix-blend-screen pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 px-6 sm:px-10 pb-8 max-w-7xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full">
              Headquarters
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-2">
              Welcome to {workspace.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base font-medium">
              {workspace.description || "Navigate through channels, manage tasks, and collaborate on documents in real-time."}
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-10 relative z-10 "
      >
        {/* 🚀 QUICK ACCESS CHANNELS */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Layers size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">Quick Access</h2>
            </div>
          </div>
          
          {channels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {channels.map((channel: any) => {
                const config = getChannelConfig(channel.type);
                return (
                  <Link 
                    key={channel._id} 
                    href={`/workspace/${workspace.publicId}/${workspace.slug}/c/${channel._id}`}
                    className={`group relative flex items-center justify-between p-4 bg-card/80 backdrop-blur-xl border border-border hover:shadow-lg hover:shadow-primary/5 rounded-2xl transition-all duration-300 overflow-hidden ${config.border}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 ease-in-out"></div>
                    <div className="flex items-center gap-3 relative z-10 overflow-hidden">
                      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${config.bg}`}>
                        {config.icon}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-foreground text-[14px] truncate group-hover:text-primary transition-colors">{channel.name}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{channel.type}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative z-10" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-border/80 rounded-2xl text-muted-foreground text-sm font-medium bg-card/30 backdrop-blur-sm flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
                <Hash size={20} className="text-muted-foreground/50" />
              </div>
              No channels found. Open the sidebar to create your first channel!
            </div>
          )}
        </motion.div>

        {/* 📊 DASHBOARD WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Widget 1: Getting Started */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-2 bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                <Sparkles size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Getting Started</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickActionCard 
                title="Invite Team Members" 
                desc="Grow your workspace by adding people." 
                icon={Users}
                link={`/workspace/${workspace.publicId}/members`}
                accent="blue"
              />
              <QuickActionCard 
                title="Set up your Profile" 
                desc="Add a photo and set your preferences." 
                icon={CheckCircle2}
                link={`/settings`}
                accent="purple"
              />
            </div>
          </motion.div>

          {/* Widget 2: Workspace Stats */}
          <motion.div variants={itemVariants} className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500">
                <Activity size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Overview</h2>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-3">
              <div className="flex justify-between items-center p-3.5 rounded-2xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
                <span className="text-sm text-muted-foreground font-semibold">Total Members</span>
                <span className="text-xl font-black text-foreground">{workspace.stats?.totalMembers || 1}</span>
              </div>
              <div className="flex justify-between items-center p-3.5 rounded-2xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
                <span className="text-sm text-muted-foreground font-semibold">Active Channels</span>
                <span className="text-xl font-black text-primary">{channels.length}</span>
              </div>
            </div>
          </motion.div>

          {/* Widget 3: My Tasks Placeholder */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-3 bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] min-h-[220px] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-500">
                  <Clock size={16} strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-bold text-foreground tracking-tight">My Active Tasks</h2>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-secondary text-muted-foreground px-2.5 py-1 rounded-full border border-border/50">Coming Soon</span>
            </div>
            <div className="flex-1 border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground/60 gap-3 bg-secondary/10">
              <SquareKanban size={28} className="opacity-40" />
              <p className="text-sm font-medium">Your assigned tasks will appear here automatically.</p>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

// 🎨 Enhanced Quick Action Card
const QuickActionCard = ({ title, desc, icon: Icon, link, accent }: any) => {
  const accentColors: any = {
    blue: "text-blue-500 bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white",
    purple: "text-purple-500 bg-purple-500/10 group-hover:bg-purple-500 group-hover:text-white",
  };

  return (
    <Link href={link} className="group relative p-5 rounded-2xl border border-border/50 bg-secondary/30 hover:bg-card hover:shadow-lg hover:border-border transition-all duration-300 cursor-pointer flex flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-all duration-300 shadow-sm ${accentColors[accent]}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <ArrowRight size={18} className="text-muted-foreground opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-foreground transition-all duration-300" />
      </div>
      <div className="relative z-10 mt-1">
        <h3 className="text-[15px] font-bold text-foreground tracking-tight mb-0.5">{title}</h3>
        <p className="text-[13px] text-muted-foreground font-medium leading-snug">{desc}</p>
      </div>
    </Link>
  );
};