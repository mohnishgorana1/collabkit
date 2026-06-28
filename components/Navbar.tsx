"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, LayoutDashboard, Settings, Hash, Users, UserCircle2, 
  SquareKanban, FileText, PlusCircle, ChevronDown, ChevronRight, Home, UserCog 
} from "lucide-react";
import ThemeToggle from "./themes/ThemeToggle";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import { cn } from "@/lib/utils";
import { useWorkspaceData } from "@/context/WorkspaceContext";
import { getWorkspaceChannels } from "@/lib/actions/channel.actions";
import CreateChannelModal from "./workspace/channel/CreateChannelModal";

// --- HELPER COMPONENTS FOR MOBILE MENU ---

const SectionLabel = ({ label }: { label: string }) => (
  <div className="mt-5 mb-1.5 px-2 text-[11px] font-extrabold text-muted-foreground/60 uppercase tracking-widest shrink-0">
    {label}
  </div>
);

const MobileNavItem = ({ href, icon: Icon, label, isActive, onClick, className = "" }: any) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
      isActive ? "bg-secondary text-foreground font-semibold shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
    } ${className}`}
  >
    <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground/70"} />
    <span className="truncate">{label}</span>
  </Link>
);

const MobileChannelGroup = ({ title, channels, icon: Icon, currentWorkspace, pathname, onAdd, setIsMobileMenuOpen }: any) => {
  const [isOpen, setIsOpen] = useState(true);

  if (channels.length === 0) return null;

  return (
    <div className="flex flex-col mb-3">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-1 mb-1 group cursor-pointer hover:bg-secondary/40 rounded-md transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {isOpen ? (
            <ChevronDown size={14} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
          <h3 className="text-[12px] font-bold text-muted-foreground/80 tracking-wide uppercase mt-[2px]">
            {title}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="btn p-1 transition-opacity rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <PlusCircle size={15} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex flex-col gap-0.5 overflow-hidden ml-2 pl-2 border-l-2 border-border/40"
          >
            {channels.map((channel: any) => {
              const isActive = pathname.includes(`/c/${channel._id}`);
              return (
                <MobileNavItem
                  key={channel._id}
                  href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}/c/${channel._id}`}
                  icon={Icon}
                  label={channel.name}
                  isActive={isActive}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-1.5 ml-2"
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN NAVBAR COMPONENT ---

const Navbar = ({ name }: { name: any }) => {
  const pathname = usePathname();
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/workspace');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isLoaded, userId } = useAuth();
  const isSignedIn = isLoaded && userId;

  // Workspace Data
  const data = useWorkspaceData();
  const workspaces = data?.workspaces || [];
  const isWorkspaceRoute = pathname.includes("/workspace/");
  const currentWorkspaceId = isWorkspaceRoute ? pathname.split("/")[2] : null;
  const currentWorkspace = workspaces.find((w: any) => w.publicId === currentWorkspaceId);

  // Channels State & Fetching
  const [channels, setChannels] = useState<any[]>([]);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<"CHAT" | "TASKS" | "DOCS">("CHAT");
  const [refreshKey, setRefreshKey] = useState(0);

  const activeWorkspaceId = currentWorkspace?._id;

  useEffect(() => {
    let isMounted = true;
    const fetchChannels = async () => {
      if (!activeWorkspaceId) return;
      const res = await getWorkspaceChannels(activeWorkspaceId);
      if (isMounted && res.success) {
        setChannels(res.channels);
      }
    };
    fetchChannels();
    return () => { isMounted = false; };
  }, [activeWorkspaceId, refreshKey]);

  const handleChannelCreated = () => setRefreshKey((prev) => prev + 1);

  const chatChannels = channels.filter((c) => c.type === "CHAT");
  const taskChannels = channels.filter((c) => c.type === "TASKS");
  const docChannels = channels.filter((c) => c.type === "DOCS");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        layout
        className={cn("fixed top-0 z-50 w-full transition-all duration-300 ",
          "mx-auto px-2 md:px-4 lg:px-6 h-16 flex items-center",
          `${scrolled ? "bg-background/50 backdrop-blur-2xl" : "bg-transparent border-transparent"}`,
          `${isProtected ? "border-b border-border/50" : ""}`
        )}
      >
        <div className="flex items-center justify-between w-full">
          <Logo />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-x-5">
            {!isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-2">Log in</Link>
                <Link href="/signup" className="text-sm font-medium bg-foreground text-background px-5 py-2.5 rounded-full">Start for free</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <div className="h-4 w-px bg-border"></div>
                <div className="bg-muted py-2 px-3 rounded-2xl flex items-center gap-2 text-primary">
                  <UserCircle2 size={12}/>
                  <p>{name}</p>
                </div>
              </div>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <ThemeToggle />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-foreground p-1 z-50 relative">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed inset-0 top-16 bg-background backdrop-blur-3xl flex flex-col pt-2 h-[calc(100vh-4rem)] border-t border-border/50 overflow-y-auto custom-thin-scrollbar"
            >
              {isProtected && isSignedIn ? (
                <div className="flex flex-col h-full px-3 py-2">
                  
                  {/* OVERVIEW */}
                  <SectionLabel label="Overview" />
                  <MobileNavItem href="/dashboard" icon={LayoutDashboard} label="My Dashboard" isActive={pathname === "/dashboard"} onClick={() => setIsMobileMenuOpen(false)} />

                  {/* CURRENT WORKSPACE */}
                  {isWorkspaceRoute && currentWorkspace && (
                    <div className="flex flex-col mt-4">
                      <SectionLabel label="Current Workspace" />
                      
                      <MobileNavItem
                        href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`}
                        icon={Home}
                        label={currentWorkspace.name}
                        isActive={pathname === `/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mb-2 font-bold"
                      />

                      {/* CATEGORIZED CHANNELS */}
                      <MobileChannelGroup
                        title="Chats"
                        channels={chatChannels}
                        icon={Hash}
                        currentWorkspace={currentWorkspace}
                        pathname={pathname}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        onAdd={() => { setModalDefaultType("CHAT"); setIsChannelModalOpen(true); }}
                      />
                      <MobileChannelGroup
                        title="Boards"
                        channels={taskChannels}
                        icon={SquareKanban}
                        currentWorkspace={currentWorkspace}
                        pathname={pathname}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        onAdd={() => { setModalDefaultType("TASKS"); setIsChannelModalOpen(true); }}
                      />
                      <MobileChannelGroup
                        title="Docs"
                        channels={docChannels}
                        icon={FileText}
                        currentWorkspace={currentWorkspace}
                        pathname={pathname}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        onAdd={() => { setModalDefaultType("DOCS"); setIsChannelModalOpen(true); }}
                      />

                      {/* MANAGEMENT */}
                      <SectionLabel label="Management" />
                      <div className="flex flex-col gap-1">
                        <MobileNavItem href={`/workspace/${currentWorkspace.publicId}/members`} icon={Users} label="Team Members" isActive={pathname.includes("/members")} onClick={() => setIsMobileMenuOpen(false)} />
                        <MobileNavItem href={`/workspace/${currentWorkspace.publicId}/settings`} icon={Settings} label="Workspace Settings" isActive={pathname.includes("/settings")} onClick={() => setIsMobileMenuOpen(false)} />
                      </div>
                    </div>
                  )}

                  {/* ACCOUNT */}
                  <div className="mt-auto pt-4 pb-4">
                    <SectionLabel label="Account" />
                    <MobileNavItem href="/settings" icon={UserCog} label="My Profile" isActive={pathname === "/settings"} onClick={() => setIsMobileMenuOpen(false)} />
                  </div>
                </div>
              ) : (
                // PUBLIC MENU
                <div className="flex flex-col h-full p-6">
                  <div className="flex flex-col gap-4 text-2xl font-semibold tracking-tight mt-4">
                    <Link href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
                    <Link href="#workflow" onClick={() => setIsMobileMenuOpen(false)}>Workflow</Link>
                  </div>
                  <div className="mt-auto flex flex-col gap-4 pb-4">
                    {!isSignedIn ? (
                      <>
                        <Link href="/login" className="w-full text-center py-4 rounded-2xl bg-secondary text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                        <Link href="/signup" className="w-full text-center py-4 rounded-2xl bg-foreground text-background font-medium" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                      </>
                    ) : (
                      <Link href="/dashboard" className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl bg-foreground text-background font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        <LayoutDashboard size={20} /> Go to Dashboard
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* MODAL (Renders correctly even when menu is closed) */}
      {currentWorkspace && (
        <CreateChannelModal
          isOpen={isChannelModalOpen}
          onClose={() => setIsChannelModalOpen(false)}
          workspaceId={currentWorkspace._id}
          defaultType={modalDefaultType}
          onSuccess={handleChannelCreated}
        />
      )}
    </>
  );
};

export default Navbar;


// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Menu, X, LayoutDashboard, Settings, Hash, Users, User, UserCircle2 } from "lucide-react";
// import ThemeToggle from "./themes/ThemeToggle";
// import { UserButton, useAuth } from "@clerk/nextjs";
// import { motion, AnimatePresence } from "motion/react";
// import Logo from "./Logo";
// import { cn } from "@/lib/utils";
// import { useWorkspaceData } from "@/context/WorkspaceContext";

// // Helper component for mobile nav items (mimics sidebar item)
// // 💡 Bahar define kiya hua Helper Component
// const MobileNavItem = ({ href, icon: Icon, label, isActive, onClick }: any) => (
//   <Link
//     href={href}
//     onClick={onClick} // 💡 Ab yeh prop se aayega
//     className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
//       }`}
//   >
//     <Icon size={20} className={isActive ? "text-primary" : ""} />
//     {label}
//   </Link>
// );

// const Navbar = ({ name }: { name: any }) => {
//   const pathname = usePathname();
//   const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/workspace');
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const { isLoaded, userId } = useAuth();
//   const isSignedIn = isLoaded && userId;

//   // Fetch workspace data from context
//   const data = useWorkspaceData();
//   const workspaces = data?.workspaces || [];

//   // Logic to find current workspace if inside a workspace route
//   const isWorkspaceRoute = pathname.includes("/workspace/");
//   const currentWorkspaceId = isWorkspaceRoute ? pathname.split("/")[2] : null;
//   const currentWorkspace = workspaces.find((w: any) => w.publicId === currentWorkspaceId);



//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);


//   return (
//     <motion.header
//       layout
//       className={cn("fixed top-0 z-50 w-full transition-all duration-300 ",
//         "mx-auto px-2 md:px-4 lg:px-6 h-16 flex items-center",
//         `${scrolled ? "bg-background/50 backdrop-blur-2xl" : "bg-transparent border-transparent"}`,
//         `${isProtected ? "border-b border-border/50" : ""}`
//       )}
//     >
//       <div className="flex items-center justify-between w-full">
//         <Logo />

//         {/* Desktop nav actions (only visible on md+) */}
//         <div className="hidden md:flex items-center gap-x-5">
//           {!isSignedIn ? (
//             <div className="flex items-center gap-4">
//               <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-2">Log in</Link>
//               <Link href="/signup" className="text-sm font-medium bg-foreground text-background px-5 py-2.5 rounded-full">Start for free</Link>
//             </div>
//           ) : (
//             <div className="flex items-center gap-4">
//               <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
//                 <LayoutDashboard size={16} /> Dashboard
//               </Link>
//               <div className="h-4 w-px bg-border"></div>
//               {/* TODO: REMOVE AFTER */}
//               <div className="bg-muted py-2 px-3 rounded-2xl flex items-center gap-2 text-primary">
//                 <UserCircle2 size={12}/>
//                 <p>{name}</p>
//                 </div>

//               {/* <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full" } }} /> */}
//             </div>
//           )}
//           <ThemeToggle />
//         </div>

//         {/* Mobile Toggle Button */}
//         <div className="flex items-center gap-4 md:hidden">
//           {/* {isSignedIn && <UserButton />} */}
//           <ThemeToggle />
//           <button
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             className="text-foreground p-1 z-50 relative"
//           >
//             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu Overlay */}
//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ type: "spring", bounce: 0, duration: 0.4 }}
//             className="md:hidden fixed inset-0 top-16 bg-background backdrop-blur-3xl flex flex-col p-6 h-[calc(100vh-4rem)] border-t border-border/50 overflow-y-auto"
//           >
//             {/* 💡 Conditionally render content based on Protected vs Public route */}
//             {isProtected && isSignedIn ? (
//               // --- PROTECTED MOBILE MENU (Looks like Sidebar) ---
//               <div className="flex flex-col h-full">
//                 <div className="flex flex-col gap-2">
//                   <MobileNavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" isActive={pathname === "/dashboard"} onClick={() => setIsMobileMenuOpen(false)} />
//                 </div>

//                 {isWorkspaceRoute && currentWorkspace && (
//                   <div className="mt-6">
//                     <div className="h-px bg-border w-full mb-6"></div>
//                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
//                       {currentWorkspace.name}
//                     </p>
//                     <div className="flex flex-col gap-2">
//                       <MobileNavItem href={`/workspace/${currentWorkspace.publicId}/${currentWorkspace.slug}`} icon={Hash} label="General" isActive={true} onClick={() => setIsMobileMenuOpen(false)} />
//                       <MobileNavItem href={`/workspace/${currentWorkspace.publicId}/members`} icon={Users} label="Members" isActive={pathname.includes("/members")} onClick={() => setIsMobileMenuOpen(false)} />
//                       <MobileNavItem href={`/workspace/${currentWorkspace.publicId}/settings`} icon={Settings} label="Settings" isActive={pathname.includes("/settings")} onClick={() => setIsMobileMenuOpen(false)} />
//                     </div>
//                   </div>
//                 )}

//                 <div className="mt-auto pt-6 border-t border-border">
//                   <MobileNavItem href="/settings" icon={Settings} label="Account Settings" isActive={pathname === "/settings"} onClick={() => setIsMobileMenuOpen(false)} />
//                 </div>
//               </div>
//             ) : (
//               // --- PUBLIC MOBILE MENU (Landing Page Links) ---
//               <div className="flex flex-col h-full">
//                 <div className="flex flex-col gap-4 text-2xl font-semibold tracking-tight mt-4">
//                   <Link href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
//                   <Link href="#workflow" onClick={() => setIsMobileMenuOpen(false)}>Workflow</Link>
//                 </div>

//                 <div className="mt-auto flex flex-col gap-4 pb-4">
//                   {!isSignedIn ? (
//                     <>
//                       <Link href="/login" className="w-full text-center py-4 rounded-2xl bg-secondary text-foreground font-medium" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
//                       <Link href="/signup" className="w-full text-center py-4 rounded-2xl bg-foreground text-background font-medium" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
//                     </>
//                   ) : (
//                     <Link href="/dashboard" className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl bg-foreground text-background font-medium" onClick={() => setIsMobileMenuOpen(false)}>
//                       <LayoutDashboard size={20} /> Go to Dashboard
//                     </Link>
//                   )}
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.header>
//   );
// };

// export default Navbar;
