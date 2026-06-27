"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Hash,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCog,
  SquareKanban,
  FileText,
  PlusCircle,
  Home
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useWorkspaceData } from "@/context/WorkspaceContext";
import { getWorkspaceChannels } from "@/lib/actions/channel.actions";
import CreateChannelModal from "./workspace/channel/CreateChannelModal";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);

  // Fetch workspace data from context
  const data = useWorkspaceData();
  const workspaces = data?.workspaces || [];

  // Logic to find current workspace if inside a workspace route
  const isWorkspaceRoute = pathname.includes("/workspace/");
  const currentWorkspaceId = isWorkspaceRoute ? pathname.split("/")[2] : null;
  const currentWorkspace = workspaces.find((w: any) => w.publicId === currentWorkspaceId);


  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<"CHAT" | "TASKS" | "DOCS">("CHAT");

  // Fetch channels when workspace changes
  const [refreshKey, setRefreshKey] = useState(0);
  const activeWorkspaceId = currentWorkspace?._id;

  useEffect(() => {
    let isMounted = true; // Memory leaks se bachne ke liye

    const fetchWorkspaceChannels = async () => {
      if (!activeWorkspaceId) return;

      const res = await getWorkspaceChannels(activeWorkspaceId);

      // Agar component abhi bhi screen par hai, tabhi state set karo
      if (isMounted && res.success) {
        setChannels(res.channels);
      }
    };

    fetchWorkspaceChannels();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [activeWorkspaceId, refreshKey]);

  // Ye function hum Modal ko pass karenge
  const handleChannelCreated = () => {
    setRefreshKey((prev) => prev + 1); // State change hote hi useEffect wapas chal jayega
  };

  const chatChannels = channels.filter((c) => c.type === "CHAT");
  const taskChannels = channels.filter((c) => c.type === "TASKS");
  const docChannels = channels.filter((c) => c.type === "DOCS");

  const collapsebtnClasses = `btn bg-background border border-border rounded-lg z-50 hover:bg-secondary transition-colors  ${isCollapsed ? "self-center" : "self-end ml-8"}`

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-background/50 backdrop-blur-3xl hidden md:flex flex-col h-full relative overflow-visible will-change-[width] pb-5 pt-5 border-r border-border/50"
    >
      {/* Collapse Toggle Button */}
      <div className="w-full flex flex-col px-3 mb-2">
        {isCollapsed ? (
          <ChevronRight onClick={() => setIsCollapsed(!isCollapsed)} size={28} className={collapsebtnClasses} />
        ) : (
          <ChevronLeft onClick={() => setIsCollapsed(!isCollapsed)} size={28} className={collapsebtnClasses} />
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="overflow-y-auto custom-thin-scrollbar flex flex-col px-3 py-2">

          {/* =======================================
              SECTION 1: GLOBAL APP OVERVIEW
              ======================================= */}
          <SectionLabel label="Overview" isCollapsed={isCollapsed} />
          <NavItem href="/dashboard" icon={LayoutDashboard} label="My Dashboard" isActive={pathname === "/dashboard"} isCollapsed={isCollapsed} />

          {/* =======================================
              SECTION 2: CURRENT WORKSPACE
              ======================================= */}
          <AnimatePresence mode="wait">
            {isWorkspaceRoute && currentWorkspace && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col mt-4">

                <SectionLabel label="Current Workspace" isCollapsed={isCollapsed} />
                {/* Workspace Home */}
                <NavItem
                  href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`}
                  icon={Home}
                  label={currentWorkspace.name}
                  isActive={pathname === `/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`}
                  isCollapsed={isCollapsed}
                  className="mb-2 font-bold"
                />

                {/* Workspace Channels (With Dropdown Style) */}
                <div className={isCollapsed ? "flex flex-col gap-3" : "ml-2 pl-2 border-l-2 border-border/40"}>
                  <ChannelGroup
                    title="Chats"
                    channels={chatChannels}
                    icon={Hash}
                    currentWorkspace={currentWorkspace}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                    onAdd={() => { setModalDefaultType("CHAT"); setIsChannelModalOpen(true); }}
                  />
                  <ChannelGroup
                    title="Boards"
                    channels={taskChannels}
                    icon={SquareKanban}
                    currentWorkspace={currentWorkspace}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                    onAdd={() => { setModalDefaultType("TASKS"); setIsChannelModalOpen(true); }}
                  />
                  <ChannelGroup
                    title="Docs"
                    channels={docChannels}
                    icon={FileText}
                    currentWorkspace={currentWorkspace}
                    pathname={pathname}
                    isCollapsed={isCollapsed}
                    onAdd={() => { setModalDefaultType("DOCS"); setIsChannelModalOpen(true); }}
                  />
                </div>

                {/* =======================================
                    SECTION 3: WORKSPACE MANAGEMENT
                    ======================================= */}
                <SectionLabel label="Management" isCollapsed={isCollapsed} />
                <div className={isCollapsed ? "flex flex-col gap-2" : ""}>
                  <NavItem
                    href={`/workspace/${currentWorkspace.publicId}/members`}
                    icon={Users} label="Team Members"
                    isActive={pathname.includes("/members")}
                    isCollapsed={isCollapsed}
                  />
                  <NavItem
                    href={`/workspace/${currentWorkspace.publicId}/settings`}
                    icon={Settings} label="Workspace Settings"
                    isActive={pathname.includes("/settings")}
                    isCollapsed={isCollapsed}
                  />
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* =======================================
              SECTION 4: USER ACCOUNT (Bottom)
              ======================================= */}
          <div className="mt-auto pt-4">
            <SectionLabel label="Account" isCollapsed={isCollapsed} />
            <NavItem href="/settings" icon={UserCog} label="My Profile" isActive={pathname === "/settings"} isCollapsed={isCollapsed} />
          </div>

        </div>
      </div>

      {/* Modal component */}
      {currentWorkspace && (
        <CreateChannelModal
          isOpen={isChannelModalOpen}
          onClose={() => setIsChannelModalOpen(false)}
          workspaceId={currentWorkspace._id}
          defaultType={modalDefaultType}
          onSuccess={handleChannelCreated}
        />
      )}

    </motion.aside>
  );
}

// Section Divider/Label
const SectionLabel = ({ label, isCollapsed }: { label: string, isCollapsed: boolean }) => {
  if (isCollapsed) return <div className="my-4 h-px bg-border w-8 mx-auto shrink-0" />;
  return (
    <div className="mt-5 mb-1.5 px-2 text-[11px] font-extrabold text-muted-foreground/60 uppercase tracking-widest shrink-0">
      {label}
    </div>
  );
};

// 💡 UPDATE: Ab empty hone par bhi header dikhega taaki user '+' daba sake
const ChannelGroup = ({ title, channels, icon, currentWorkspace, pathname, isCollapsed, onAdd }: any) => {
  const [isOpen, setIsOpen] = useState(true);

  // Agar sidebar collapsed hai aur koi channel nahi hai, sirf tab hide karo
  if (isCollapsed && channels.length === 0) return null;

  return (
    <div className={`flex flex-col ${isCollapsed ? "gap-2" : "mb-3"}`}>

      {/* Group Title (Clickable Dropdown Header) */}
      {!isCollapsed && (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-2 py-1 mb-1 group cursor-pointer hover:bg-secondary/40 rounded-md transition-colors"
        >
          <div className="flex items-center gap-1.5">
            {isOpen ? (
              <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
            <h3 className="text-[12px] font-bold text-muted-foreground/80 tracking-wide uppercase mt-[2px] group-hover:text-foreground transition-colors">
              {title}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="btn transition-opacity rounded-full opacity-0 group-hover:opacity-100"
          >
            <PlusCircle size={15} className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      )}

      {/* Render Channels (With Smooth Height Animation) */}
      <AnimatePresence initial={false}>
        {(isCollapsed || isOpen) && (
          <motion.div
            initial={isCollapsed ? false : { height: 0, opacity: 0 }}
            animate={isCollapsed ? false : { height: "auto", opacity: 1 }}
            exit={isCollapsed ? false : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={`flex flex-col overflow-hidden  ${isCollapsed ? "gap-2" : "gap-0.5"}`}
          >
            {/* 💡 NAYA: Agar channel khali hai, toh ek chota sa empty state dikhao */}
            {channels.length !== 0 &&
              channels.map((channel: any) => {
                const isActive = pathname.includes(`/c/${channel._id}`);
                return (
                  <NavItem
                    key={channel._id}
                    href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}/c/${channel._id}`}
                    icon={icon}
                    label={channel.name}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    className={isCollapsed ? "" : "py-1.5 text-sm ml-2"}
                  />
                );
              })
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main NavItem (Prominent Hover Effect applied here)
const NavItem = ({ href, icon: Icon, label, isActive, isCollapsed, className = "" }: { href: string, icon: any, label: string, isActive: boolean, isCollapsed: boolean, className?: string }) => {
  const iconSize = isCollapsed ? 22 : 18;

  return (
    <Link
      href={href}
      title={isCollapsed ? label : ""}
      className={`group relative flex items-center transition-all duration-200 ease-in-out shrink-0 hover:bg-secondary/60
        ${isCollapsed ? "justify-center w-12 h-12 rounded-xl mx-auto" : "justify-start px-3 py-2 rounded-lg gap-3"}
        ${isActive ? "text-foreground font-semibold" : "text-muted-foreground"}
        ${className}`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className={`absolute inset-0 bg-secondary -z-10 shadow-sm border border-border/50 ${isCollapsed ? "rounded-xl" : "rounded-lg"}`}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <Icon size={iconSize} className={`${isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground transition-colors"}`} />

      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="truncate group-hover:text-foreground transition-colors"
        >
          {label}
        </motion.span>
      )}
    </Link>
  );
}