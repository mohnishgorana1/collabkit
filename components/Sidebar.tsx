"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Hash, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import WorkspaceActionModal from "./workspace/WorkspaceActionModal";

export default function Sidebar({ workspaces }: { workspaces: any[] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const isWorkspaceRoute = pathname.includes("/workspace/");
  const currentWorkspaceId = isWorkspaceRoute ? pathname.split("/")[2] : null;
  const currentWorkspace = workspaces.find((w) => w.publicId === currentWorkspaceId);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="border-r border-border bg-background/50 backdrop-blur-3xl hidden md:flex flex-col justify-between h-full relative overflow-visible will-change-[width] pb-5"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-[13px] bg-background border border-border rounded-lg p-1 z-50 hover:bg-secondary transition-colors`}
      >
        {isCollapsed ? <ChevronRight size={14} className=""/> : <ChevronLeft size={14} className=""/>}
      </button>

      <div className="overflow-y-auto py-6 flex flex-col gap-6 px-3">
        <div className="flex flex-col gap-1">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname === "/dashboard"} isCollapsed={isCollapsed} />
        </div>

        <AnimatePresence mode="wait">
          {isWorkspaceRoute && currentWorkspace && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="px-3 mb-6"><div className="h-px bg-border w-full"></div></div>
              <div className="flex flex-col gap-1">
                <NavItem href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`} icon={Hash} label="General" isActive={true} isCollapsed={isCollapsed} />
                <NavItem href={`/workspace/${currentWorkspace.publicId}/members`} icon={Users} label="Members" isActive={pathname.includes("/members")} isCollapsed={isCollapsed} />
                <NavItem href={`/workspace/${currentWorkspace.publicId}/settings`} icon={Settings} label="Settings" isActive={pathname.includes("/settings")} isCollapsed={isCollapsed} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3 border-t border-border pt-4">
        <NavItem href="/settings" icon={Settings} label="Account" isActive={pathname === "/settings"} isCollapsed={isCollapsed} />
      </div>
    </motion.aside>
  );
}

const NavItem = ({ href, icon: Icon, label, isActive, isCollapsed }: { href: string, icon: any, label: string, isActive: boolean, isCollapsed: boolean }) => (
  <Link
    href={href}
    title={isCollapsed ? label : ""}
    className={`relative flex items-center transition-all duration-300 ease-in-out
      ${isCollapsed ? "justify-center w-12 h-12 rounded-xl mx-auto" : "justify-start px-3 py-2.5 rounded-xl gap-3"}
      ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
  >
    {/* Active Background - Sirf tab dikhega jab active ho */}
    {isActive && (
      <motion.div
        layoutId="sidebar-active-bg"
        className={`absolute inset-0 bg-secondary -z-10 ${isCollapsed ? "rounded-xl" : "rounded-xl"}`}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    )}

    <Icon size={20} className={`${isActive ? "text-primary" : ""}`} />

    {!isCollapsed && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-sm font-medium truncate"
      >
        {label}
      </motion.span>
    )}
  </Link>
);