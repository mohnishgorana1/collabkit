"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Hash, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useWorkspaceData } from "@/context/WorkspaceContext";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Fetch workspace data from context
  const data = useWorkspaceData();
  const workspaces = data?.workspaces || [];

  // Logic to find current workspace if inside a workspace route
  const isWorkspaceRoute = pathname.includes("/workspace/");
  const currentWorkspaceId = isWorkspaceRoute ? pathname.split("/")[2] : null;
  const currentWorkspace = workspaces.find((w: any) => w.publicId === currentWorkspaceId);

  const collapsebtnClasses = `btn bg-background border border-border rounded-lg z-50 hover:bg-secondary transition-colors  ${isCollapsed ? "self-center" : "self-end ml-8"}`
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 200 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-background/50 backdrop-blur-3xl hidden md:flex flex-col h-full relative overflow-visible will-change-[width] pb-5 pt-5"
    >

      {/* Collapse Toggle Button */}
      <div className="w-full flex flex-col px-3">
        
        {isCollapsed ? (
          <ChevronRight onClick={() => setIsCollapsed(!isCollapsed)} size={28} className={collapsebtnClasses} />
        ) : (
          <ChevronLeft onClick={() => setIsCollapsed(!isCollapsed)} size={28} className={collapsebtnClasses} />
        )}
      </div>


      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="overflow-y-auto no-scrollbar flex flex-col px-3 py-4">

          {/* Dashboard */}
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname === "/dashboard"} isCollapsed={isCollapsed} />


          {/* Workspaces */}
          <AnimatePresence mode="wait">
            {isWorkspaceRoute && currentWorkspace && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Divider />
                <div className="flex flex-col gap-1">
                  <NavItem href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`} icon={Hash} label="General" isActive={true} isCollapsed={isCollapsed} />
                  <NavItem href={`/workspace/${currentWorkspace.publicId}/members`} icon={Users} label="Members" isActive={pathname.includes("/members")} isCollapsed={isCollapsed} />
                  <NavItem href={`/workspace/${currentWorkspace.publicId}/settings`} icon={Settings} label="Settings" isActive={pathname.includes("/settings")} isCollapsed={isCollapsed} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Divider />
          {/* account */}
          <div className="">
            <NavItem href="/settings" icon={Settings} label="Account" isActive={pathname === "/settings"} isCollapsed={isCollapsed} />
          </div>
        </div>


      </div>


    </motion.aside>
  );
}

const NavItem = ({ href, icon: Icon, label, isActive, isCollapsed }: { href: string, icon: any, label: string, isActive: boolean, isCollapsed: boolean }) => (
  <Link
    href={href}
    title={isCollapsed ? label : ""}
    className={`relative flex items-center transition-all duration-300 ease-in-out hover:bg-background/50
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


const Divider = () => {
  return (
    <div className="px-3"><div className="my-4 h-px bg-border w-full"></div></div>
  )
}