"use client";

import React from 'react';
import { Sparkles, Activity, CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceDashboard({ workspace }: { workspace: any }) {
  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full overflow-y-auto custom-thin-scrollbar">
      
      {/* 🌟 Welcome Banner */}
      <div className="relative h-48 sm:h-56 bg-linear-to-br from-primary/10 via-background to-secondary/20 border-b border-border/60 p-8 flex flex-col justify-end shrink-0 overflow-hidden">
        {/* Background Decorative Pattern (Optional) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            {/* <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
              {workspace.name.charAt(0).toUpperCase()}
            </div> */}
            <h1 className="text-3xl font-bold text-foreground">
              Welcome to {workspace.name}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm mt-2">
            {workspace.description || "This is your team's headquarters. Navigate through channels, manage tasks, and collaborate on documents."}
          </p>
        </div>
      </div>

      {/* 📊 Dashboard Widgets Area */}
      <div className="p-8 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Getting Started / Quick Actions */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-foreground">Getting Started</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard 
              title="Invite Team Members" 
              desc="Grow your workspace by adding people." 
              icon={Users}
              link={`/workspace/${workspace.publicId}/members`}
            />
            <QuickActionCard 
              title="Set up your Profile" 
              desc="Add a photo and set your preferences." 
              icon={CheckCircle2}
              link={`/settings`}
            />
          </div>
        </div>

        {/* Widget 2: Workspace Stats */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-muted-foreground" size={20} />
            <h2 className="text-lg font-semibold text-foreground">Workspace Stats</h2>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-sm text-muted-foreground font-medium">Total Members</span>
              <span className="text-lg font-bold text-foreground">{workspace.stats?.totalMembers || 1}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-sm text-muted-foreground font-medium">Active Channels</span>
              <span className="text-lg font-bold text-foreground">--</span>
            </div>
          </div>
        </div>

        {/* Widget 3: My Tasks Placeholder (For Future) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-card border border-border/60 rounded-2xl p-6 shadow-sm min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              <h2 className="text-lg font-semibold text-foreground">My Active Tasks</h2>
            </div>
            <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded-md">Coming Soon</span>
          </div>
          <div className="h-32 border-2 border-dashed border-border/60 rounded-xl flex items-center justify-center text-muted-foreground/50 text-sm font-medium">
            Your assigned tasks across all Kanban boards will appear here.
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper component for Quick Action Cards
const QuickActionCard = ({ title, desc, icon: Icon, link }: any) => (
  <Link href={link} className="group p-4 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/50 hover:border-primary/30 transition-all cursor-pointer flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-foreground group-hover:text-primary transition-colors shadow-sm">
        <Icon size={16} />
      </div>
      <ArrowRight size={16} className="text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{desc}</p>
    </div>
  </Link>
);