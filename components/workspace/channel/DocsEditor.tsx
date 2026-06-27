"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle2, Clock, Users, Link as LinkIcon, Download, Trash2, X } from "lucide-react";
import { updateDocumentContent, updateDocumentEditors } from "@/lib/actions/document.actions"; // 💡 UPDATE 1: updateDocumentContent wapas laya
import { deleteGenericChannel } from "@/lib/actions/channel.actions";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from 'motion/react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/utils";

// --- LIVEBLOCKS IMPORTS ---
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { useRoom, useSelf, useSyncStatus, useOthers, useBroadcastEvent, useEventListener } from "@liveblocks/react/suspense"; // 💡 UPDATE 2: Event Hooks add kiye
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";

// --- BLOCKNOTE IMPORTS ---
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

// ==========================================
// 1. COLLABORATIVE EDITOR ENGINE (With MongoDB Backup)
// ==========================================
function CollaborativeEditor({ doc, provider, resolvedTheme, isEditable, documentId }: any) {
    const currentUser = useSelf();
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const editor = useCreateBlockNote({
        collaboration: {
            provider,
            fragment: doc.getXmlFragment("document-store"),
            user: {
                name: currentUser?.info?.name || "Anonymous",
                color: currentUser?.info?.color || "#ff0000",
            },
        },
    });

    return (
        <BlockNoteView
            editor={editor}
            editable={isEditable}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            className="pb-12"
            // 💡 FIX 1: SILENT MONGODB BACKUP
            // Liveblocks real-time handle karega, aur ye function chupchap DB me permanent backup bhejega
            onChange={() => {
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = setTimeout(async () => {
                    const jsonContent = JSON.stringify(editor.document);
                    await updateDocumentContent(documentId, jsonContent);
                }, 2000); // 2 second pause ke baad DB update
            }}
        />
    );
}

// ==========================================
// 2. ROOM SETUP COMPONENT
// ==========================================
function BlockNoteRoom({ resolvedTheme, isEditable, documentId }: any) {
    const room = useRoom();
    const [doc, setDoc] = useState<Y.Doc>();
    const [provider, setProvider] = useState<any>();

    useEffect(() => {
        const yDoc = new Y.Doc();
        const yProvider = new LiveblocksYjsProvider(room as any, yDoc);
        setDoc(yDoc);
        setProvider(yProvider);

        return () => {
            yDoc?.destroy();
            yProvider?.destroy();
        };
    }, [room]);

    if (!doc || !provider) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    return <CollaborativeEditor doc={doc} provider={provider} resolvedTheme={resolvedTheme} isEditable={isEditable} documentId={documentId} />;
}

// ==========================================
// 3. STATUS INDICATORS & ACTIVE USERS
// ==========================================
function DesktopSyncStatus() {
    const status = useSyncStatus();
    const isSaving = status === "synchronizing";
    return (
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background px-3 py-3 rounded-lg border border-border shadow-sm">
            {isSaving ? <Loader2 size={14} className="animate-spin text-primary" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
            {isSaving ? "Saving..." : "Saved"}
        </div>
    );
}

function MobileSyncStatus() {
    const status = useSyncStatus();
    const isSaving = status === "synchronizing";
    return (
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border">
            {isSaving ? <Loader2 size={10} className="animate-spin text-primary" /> : <CheckCircle2 size={10} className="text-emerald-500" />}
            {isSaving ? "Saving..." : "Saved"}
        </div>
    );
}

function ActiveUsers() {
    const currentUser = useSelf();
    const others = useOthers();

    return (
        <div className="flex items-center gap-2 bg-background px-3 py-2.5 rounded-lg border border-border shadow-sm">
            <div className="flex -space-x-2 overflow-hidden px-1">
                <div className="relative inline-block ring-2 ring-background rounded-full z-10" title="You">
                    {currentUser?.info?.avatar ? (
                        <Image src={currentUser.info.avatar} alt="You" width={28} height={28} className="rounded-full bg-secondary object-cover" />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[9px] font-black">{getInitials(currentUser?.info?.name || "User")}</div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full"></span>
                </div>
                {others.map((other) => (
                    <div key={other.connectionId} className="relative inline-block ring-2 ring-background rounded-full" title={other.info?.name} style={{ zIndex: 9 }}>
                        {other.info?.avatar ? (
                            <Image src={other.info.avatar} alt={other.info.name} width={28} height={28} className="rounded-full bg-secondary object-cover" />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[9px] font-black">{getInitials(other.info?.name || "User")}</div>
                        )}
                        <span className="absolute inset-0 rounded-full border-2" style={{ borderColor: other.info?.color || '#10b981' }}></span>
                    </div>
                ))}
            </div>
            <span className="text-xs font-semibold text-muted-foreground ml-1">
                {others.length === 0 ? "Only you" : `+${others.length} online`}
            </span>
        </div>
    );
}

// ==========================================
// 4. INNER COMPONENT (Ab iske paas Broadcast Event ka access hai)
// ==========================================
function DocsEditorInner({ initialDocument, isEditable, workspaceMembers, currentUserId, channelCreatorId, workspaceOwnerId, workspaceId }: any) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    // Broadcast Hooks for Auto-Refresh Permissions
    const broadcast = useBroadcastEvent();

    const [isManageEditorsOpen, setIsManageEditorsOpen] = useState(false);
    const [editorsList, setEditorsList] = useState(initialDocument?.allowedEditors || []);
    const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const canDelete = currentUserId === channelCreatorId || currentUserId === workspaceOwnerId;

    useEffect(() => setMounted(true), []);

    // 💡 FIX 2: REAL-TIME PERMISSION LISTENER
    // Agar koi doosra admin permissions change karega, toh yahan automatic signal aayega aur page refresh ho jayega.
    useEventListener(({ event }) => {
        if (event.type === "PERMISSIONS_UPDATED") {
            toast("Access updated! Refreshing view...");
            router.refresh(); 
        }
    });

    useEffect(() => {
        const highlightActiveBlock = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;
            document.querySelectorAll('.active-line').forEach((el) => el.classList.remove('active-line'));
            let node = selection.anchorNode;
            if (!node) return;
            if (node.nodeType === 3) node = node.parentNode;
            const blockNode = (node as Element).closest('.bn-block-outer');
            if (blockNode) {
                blockNode.classList.add('active-line');
            }
        };

        document.addEventListener('selectionchange', highlightActiveBlock);
        document.addEventListener('keyup', highlightActiveBlock);
        document.addEventListener('click', highlightActiveBlock);

        return () => {
            document.removeEventListener('selectionchange', highlightActiveBlock);
            document.removeEventListener('keyup', highlightActiveBlock);
            document.removeEventListener('click', highlightActiveBlock);
        };
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Document link copied!");
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        const res = await deleteGenericChannel(initialDocument.channelId, workspaceId, currentUserId);
        if (res.success) {
            toast.success("Document deleted!");
            router.push(`/workspace/${workspaceId}`);
        } else {
            toast.error(res.error || "Error Deleting!");
            setIsDeleting(false);
            setShowConfirmDelete(false);
        }
    };

    const toggleEditor = async (memberId: string) => {
        setIsUpdatingPermissions(true);
        const isAlreadyEditor = editorsList.some((e: any) => e._id === memberId);
        let newEditorIds = isAlreadyEditor
            ? editorsList.filter((e: any) => e._id !== memberId).map((e: any) => e._id)
            : [...editorsList.map((e: any) => e._id), memberId];

        const res = await updateDocumentEditors(initialDocument._id, newEditorIds);
        if (res.success) {
            setEditorsList(res.editors);
            
            // 💡 SIGNAL BHEJO BAAT BAAR REFRESH NAHI KARNA PADEGA
            broadcast({ type: "PERMISSIONS_UPDATED" });
            router.refresh(); // Khud ka UI bhi refresh kar lo

            toast.success(isAlreadyEditor ? "Editor removed" : "Editor added");
        } else {
            toast.error("Failed to update permissions");
        }
        setIsUpdatingPermissions(false);
    };

    if (!mounted) return <div className="flex-1 flex items-center justify-center bg-background"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    return (
        <div className="flex flex-col md:flex-row h-full bg-background relative overflow-hidden">
            {/* --- MOBILE VIEW: Top Bar --- */}
            <div className="md:hidden flex items-center justify-between p-3 border-b border-border bg-card shadow-sm shrink-0 z-10 relative">
                <span className="text-sm font-semibold text-foreground">Document</span>
                <ClientSideSuspense fallback={<div className="text-[10px] text-muted-foreground">Connecting...</div>}>
                    <MobileSyncStatus />
                </ClientSideSuspense>
            </div>

            {/* --- LEFT SECTION: Editor --- */}
            <section className="flex-1 overflow-y-auto custom-thin-scrollbar relative z-0 bg-secondary/10 dark:bg-black/20">
                <div className="mx-auto w-full flex flex-col min-h-full">
                    <div className="flex-1 w-full bg-card border border-border/60 shadow-lg p-4 sm:p-10
                        [&_.bn-container]:!bg-transparent 
                        [&_.bn-container[data-theme]]:!bg-transparent 
                        [&_.ProseMirror]:!bg-transparent 
                        [&_.bn-container]:!font-sans 
                        [&_.bn-editor]:!min-h-[60vh] 
                        [&_.bn-editor]:!px-2 sm:[&_.bn-editor]:!px-4 
                        
                        /* BULLETPROOF ACTIVE LINE CSS */
                        [&_.bn-block-content]:transition-colors
                        [&_.bn-block-content]:duration-200
                        [&_.active-line_.bn-block-content]:!bg-foreground/5
                        [&_.active-line_.bn-block-content]:!rounded-md
                        [&_.active-line_.bn-block-content]:!ring-4
                        [&_.active-line_.bn-block-content]:!ring-foreground/5
                    ">
                        <ClientSideSuspense fallback={<div className="flex justify-center mt-20"><Loader2 className="animate-spin text-muted-foreground" /></div>}>
                            <BlockNoteRoom resolvedTheme={resolvedTheme} isEditable={isEditable} documentId={initialDocument._id} />
                        </ClientSideSuspense>
                    </div>
                </div>
            </section>

            {/* --- RIGHT SECTION: Sidebar --- */}
            <section className="hidden md:flex flex-col w-64 lg:w-[300px] shrink-0 border-l border-border bg-card p-6 overflow-y-auto custom-thin-scrollbar shadow-[-15px_0_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-[-15px_0_30px_-10px_rgba(0,0,0,0.4)] z-10 relative">
                
                <div className="mb-8">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Status</h3>
                    <ClientSideSuspense fallback={<div>Loading...</div>}>
                        <DesktopSyncStatus />
                    </ClientSideSuspense>
                </div>

                <div className="mb-8">
                    <h3 className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Now
                    </h3>
                    <ClientSideSuspense fallback={<Loader2 className="animate-spin text-muted-foreground" size={16} />}>
                        <ActiveUsers />
                    </ClientSideSuspense>
                </div>

                {/* 2. EDITORS LIST */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">Editors</h3>
                        {isEditable && (
                            <button onClick={() => setIsManageEditorsOpen(true)} className="text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors">+ Manage</button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-xl border border-border/50">
                        <div className="flex -space-x-2 overflow-hidden px-1">
                            {editorsList.map((editor: any) => {
                                const editorName = `${editor.firstName} ${editor.lastName}`.trim() || "User";
                                return editor.avatarUrl ? (
                                    <Image key={editor._id} src={editor.avatarUrl} alt={editorName} title={editorName} width={32} height={32} className="inline-block h-8 w-8 rounded-full ring-2 ring-card object-cover bg-secondary" />
                                ) : (
                                    <div key={editor._id} title={`Assigned to: ${editorName}`} className="w-8 h-8 rounded-full ring-2 ring-card bg-secondary flex items-center justify-center text-[9px] font-black">{getInitials(editorName)}</div>
                                );
                            })}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground ml-2">{editorsList.length} {editorsList.length === 1 ? 'Editor' : 'Editors'}</span>
                    </div>
                </div>

                {/* 3. PROPERTIES */}
                <div className="mb-8">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Properties</h3>
                    <div className="flex flex-col gap-3.5 text-xs text-muted-foreground bg-muted/40 p-4 rounded-xl border border-border/50 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-foreground/70"><Clock size={14} /> Created</div>
                            <span className="font-semibold text-foreground truncate max-w-[90px]">{new Date(initialDocument.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                        <div className="h-px w-full bg-border/60" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-foreground/70"><Users size={14} /> Access</div>
                            <span className="font-semibold text-foreground bg-background px-2 py-0.5 rounded border border-border/50 shadow-sm">Workspace</span>
                        </div>
                    </div>
                </div>

                {/* 4. ACTIONS */}
                <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Actions</h3>
                    <div className="flex flex-col gap-2.5">
                        <button onClick={handleCopyLink} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold bg-background border border-border hover:bg-accent hover:text-accent-foreground rounded-lg transition-all text-muted-foreground shadow-sm">
                            <LinkIcon size={14} /> Copy Link
                        </button>
                        <button className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold bg-background border border-border hover:bg-accent hover:text-accent-foreground rounded-lg transition-all text-muted-foreground shadow-sm">
                            <Download size={14} /> Export to PDF
                        </button>
                        {canDelete && (
                            <div className="mt-4 border-t border-border pt-5">
                                <button onClick={() => setShowConfirmDelete(true)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all text-red-600 dark:text-red-400 shadow-sm">
                                    <Trash2 size={14} /> Delete Document
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* --- MANAGE EDITORS MODAL --- */}
            {isManageEditorsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
                            <h2 className="font-semibold text-foreground">Manage Editors</h2>
                            <button onClick={() => setIsManageEditorsOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                        </div>
                        <div className="p-2 max-h-[60vh] overflow-y-auto custom-thin-scrollbar">
                            {workspaceMembers.map((member: any) => {
                                const isEditor = editorsList.some((e: any) => e._id === member._id);
                                const isMe = member._id === currentUserId;
                                const memberName = member.name || `${member.firstName} ${member.lastName}`;
                                return (
                                    <div key={member._id} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Image src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}`} alt={memberName} width={36} height={36} className="rounded-full bg-secondary object-cover" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{memberName} {isMe && "(You)"}</span>
                                                <span className="text-xs text-muted-foreground">{member.email}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => toggleEditor(member._id)} disabled={isUpdatingPermissions || isMe} className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${isEditor ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-primary text-primary-foreground hover:opacity-90"} disabled:opacity-50 disabled:cursor-not-allowed`}>
                                            {isEditor ? "Remove" : "Add"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <AnimatePresence>
                {showConfirmDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-sm overflow-hidden">
                            <div className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
                                    <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                                </div>
                                <h2 className="font-semibold text-lg text-foreground">Delete Document?</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">Are you sure you want to delete this document? This action cannot be undone.</p>
                            </div>
                            <div className="flex gap-3 p-4 bg-secondary/30 border-t border-border">
                                <button onClick={() => setShowConfirmDelete(false)} disabled={isDeleting} className="flex-1 px-4 py-2.5 text-sm font-semibold bg-background border border-border hover:bg-accent rounded-lg transition-all text-muted-foreground shadow-sm disabled:opacity-50">Cancel</button>
                                <button onClick={handleConfirmDelete} disabled={isDeleting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm disabled:opacity-50">
                                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

// ==========================================
// 5. MAIN WRAPPER (Providers setup)
// ==========================================
// 💡 MAIN CHANGE: Humne Providers ko bahar nikal diya taaki Inner component useBroadcastEvent hook ko access kar sake!
export default function DocsEditor(props: any) {
    return (
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
            <RoomProvider id={props.initialDocument.channelId} initialPresence={{}}>
                <DocsEditorInner {...props} />
            </RoomProvider>
        </LiveblocksProvider>
    );
}