"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle2, Clock, Users, FileText, Link as LinkIcon, Download, Trash2, X } from "lucide-react";
import { updateDocumentContent, updateDocumentEditors } from "@/lib/actions/document.actions";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from 'motion/react'
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteGenericChannel } from "@/lib/actions/channel.actions";
import { getInitials } from "@/lib/utils";

// Inner Editor
function InnerEditor({ initialBlocks, resolvedTheme, onEditorChange, isEditable }: any) {
    const editor = useCreateBlockNote({
        initialContent: initialBlocks,
    });

    return (
        <BlockNoteView
            editor={editor}
            editable={isEditable}
            onChange={() => onEditorChange(editor)}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            className="pb-12"
        />
    );
}

export default function DocsEditor({ initialDocument, isEditable, workspaceMembers, currentUserId, channelCreatorId, workspaceOwnerId, workspaceId }: any) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // save
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Waiting to save...">("Saved");


    // editors
    const [isManageEditorsOpen, setIsManageEditorsOpen] = useState(false);
    const [editorsList, setEditorsList] = useState(initialDocument?.allowedEditors || []);
    const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);


    // Delete states
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const canDelete = currentUserId === channelCreatorId || currentUserId === workspaceOwnerId;


    // data
    const initialBlocks = initialDocument.content ? JSON.parse(initialDocument.content) : undefined;



    const handleEditorChange = (editorInstance: any) => {
        setSaveStatus("Waiting to save...");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            setSaveStatus("Saving...");

            const jsonContent = JSON.stringify(editorInstance.document);
            const res = await updateDocumentContent(initialDocument._id, jsonContent);

            if (res.success) {
                setSaveStatus("Saved");
            } else {
                setSaveStatus("Waiting to save...");
            }
            setIsSaving(false);
        }, 1500);
    };
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
        let newEditorIds;

        if (isAlreadyEditor) {
            // Remove logic
            newEditorIds = editorsList.filter((e: any) => e._id !== memberId).map((e: any) => e._id);
        } else {
            // Add logic
            newEditorIds = [...editorsList.map((e: any) => e._id), memberId];
        }

        const res = await updateDocumentEditors(initialDocument._id, newEditorIds);

        if (res.success) {
            setEditorsList(res.editors);
            toast.success(isAlreadyEditor ? "Editor removed" : "Editor added");
        } else {
            toast.error("Failed to update permissions");
        }

        setIsUpdatingPermissions(false);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const highlightActiveBlock = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            // Pehle saari purani highlights hatao
            document.querySelectorAll('.active-line').forEach((el) => el.classList.remove('active-line'));

            // Cursor wali node dhoondo
            let node = selection.anchorNode;
            if (!node) return;
            if (node.nodeType === 3) node = node.parentNode;

            // Najdeeki BlockNote line (outer wrapper) pakdo
            const blockNode = (node as Element).closest('.bn-block-outer');
            if (blockNode) {
                blockNode.classList.add('active-line');
            }
        };

        // Har tarah ke events track karo kyunki BlockNote elements delete/recreate karta hai
        document.addEventListener('selectionchange', highlightActiveBlock);
        document.addEventListener('keyup', highlightActiveBlock); // Typing karte waqt
        document.addEventListener('click', highlightActiveBlock); // Click karte waqt

        return () => {
            document.removeEventListener('selectionchange', highlightActiveBlock);
            document.removeEventListener('keyup', highlightActiveBlock);
            document.removeEventListener('click', highlightActiveBlock);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    if (!mounted) {
        return <div className="flex-1 flex items-center justify-center bg-background"><Loader2 className="animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="flex flex-col md:flex-row h-full bg-background relative overflow-hidden">

            {/* --- MOBILE VIEW: Top Bar --- */}
            <div className="md:hidden flex items-center justify-between p-3 border-b border-border bg-card shadow-sm shrink-0 z-10 relative">
                <span className="text-sm font-semibold text-foreground">Document</span>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border">
                    {isSaving ? <Loader2 size={10} className="animate-spin text-primary" /> : <CheckCircle2 size={10} className="text-emerald-500" />}
                    {saveStatus}
                </div>
            </div>

            {/* --- LEFT SECTION: Editor --- */}
            <section className="flex-1 overflow-y-auto custom-thin-scrollbar relative z-0 bg-secondary/10 dark:bg-black/20">
                <div className="mx-auto w-full flex flex-col min-h-full">

                    <div className="flex-1 w-full bg-card border border-border/60 shadow-lg p-4 sm:p-10
                        
                        /* Base BlockNote Resets */
                        [&_.bn-container]:!bg-transparent 
                        [&_.bn-container[data-theme]]:!bg-transparent 
                        [&_.ProseMirror]:!bg-transparent 
                        [&_.bn-container]:!font-sans 
                        [&_.bn-editor]:!min-h-[60vh] 
                        [&_.bn-editor]:!px-2 sm:[&_.bn-editor]:!px-4 
                        
                        /* 💡 BULLETPROOF ACTIVE LINE CSS */
                        /* Ab yeh BlockNote ke har internal rebuild par focus pakad lega */
                        [&_.bn-block-content]:transition-colors
                        [&_.bn-block-content]:duration-200
                        [&_.active-line_.bn-block-content]:!bg-foreground/5
                        [&_.active-line_.bn-block-content]:!rounded-md
                        [&_.active-line_.bn-block-content]:!ring-4
                        [&_.active-line_.bn-block-content]:!ring-foreground/5
                    ">
                        <InnerEditor
                            initialBlocks={initialBlocks}
                            resolvedTheme={resolvedTheme}
                            onEditorChange={handleEditorChange}
                            isEditable={isEditable}
                        />
                    </div>
                </div>
            </section>

            {/* --- RIGHT SECTION: Sidebar --- */}
            <section className="hidden md:flex flex-col w-64 lg:w-[300px] shrink-0 border-l border-border bg-card p-6 overflow-y-auto custom-thin-scrollbar shadow-[-15px_0_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-[-15px_0_30px_-10px_rgba(0,0,0,0.4)] z-10 relative">

                {/* 1. SAVE STATUS */}
                <div className="mb-8">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Status
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background px-3 py-3 rounded-lg border border-border shadow-sm">
                        {isSaving ? <Loader2 size={14} className="animate-spin text-primary" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                        {saveStatus}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
                            Editors
                        </h3>
                        {isEditable && (
                            <button
                                onClick={() => setIsManageEditorsOpen(true)}
                                className="text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors"
                            >
                                + Manage
                            </button>
                        )}
                    </div>

                    {/* Avatar Overlap Stack (Ab State se map hoga) */}
                    <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-xl border border-border/50">
                        <div className="flex -space-x-2 overflow-hidden px-1">
                            {editorsList.map((editor: any) => {
                                const editorName = `${editor.firstName} ${editor.lastName}`.trim() || "User";
                                return (
                                    editor.avatarUrl ? (
                                        <Image
                                            key={editor._id}
                                            src={editor.avatarUrl}
                                            alt={editorName}
                                            title={editorName}
                                            width={32} height={32}
                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-card object-cover bg-secondary"
                                        />
                                    ) : (
                                        <div
                                            key={editor._id}
                                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-black overflow-hidden tracking-tighter `}
                                            title={`Assigned to: ${editorName}`}
                                        >
                                            {getInitials(editorName)}
                                        </div>
                                    )
                                )
                            })}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground ml-2">
                            {editorsList.length} {editorsList.length === 1 ? 'Editor' : 'Editors'}
                        </span>

                    </div>
                </div>

                {/* 2. DOCUMENT PROPERTIES */}
                <div className="mb-8">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Properties
                    </h3>
                    <div className="flex flex-col gap-3.5 text-xs text-muted-foreground bg-muted/40 p-4 rounded-xl border border-border/50 shadow-sm">

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-foreground/70"><Clock size={14} /> Last Edited</div>
                            <span className="font-semibold text-foreground truncate max-w-[90px]">
                                {new Date(initialDocument.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>

                        <div className="h-px w-full bg-border/60" /> {/* Divider */}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-foreground/70"><Users size={14} /> Access</div>
                            <span className="font-semibold text-foreground bg-background px-2 py-0.5 rounded border border-border/50 shadow-sm">Workspace</span>
                        </div>
                    </div>
                </div>

                {/* 3. QUICK ACTIONS */}
                <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        Actions
                    </h3>
                    <div className="flex flex-col gap-2.5">
                        <button onClick={handleCopyLink} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold bg-background border border-border hover:bg-accent hover:text-accent-foreground rounded-lg transition-all text-muted-foreground shadow-sm">
                            <LinkIcon size={14} /> Copy Link
                        </button>

                        <button className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold bg-background border border-border hover:bg-accent hover:text-accent-foreground rounded-lg transition-all text-muted-foreground shadow-sm">
                            <Download size={14} /> Export to PDF
                        </button>

                        {/* Normal Delete Button jo modal trigger karega */}
                        {canDelete && (
                            <div className="mt-4 border-t border-border pt-5">
                                <button
                                    onClick={() => setShowConfirmDelete(true)}
                                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-all text-red-600 dark:text-red-400 shadow-sm"
                                >
                                    <Trash2 size={14} />
                                    Delete Document
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {isManageEditorsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
                            <h2 className="font-semibold text-foreground">Manage Editors</h2>
                            <button onClick={() => setIsManageEditorsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-2 max-h-[60vh] overflow-y-auto custom-thin-scrollbar">
                            {workspaceMembers.map((member: any) => {
                                const isEditor = editorsList.some((e: any) => e._id === member._id);
                                const isMe = member._id === currentUserId;
                                const memberName = member.name
                                return (
                                    <div key={member._id} className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}`}
                                                alt={memberName} width={36} height={36}
                                                className="rounded-full bg-secondary object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">
                                                    {memberName} {isMe && "(You)"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{member.email}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => toggleEditor(member._id)}
                                            disabled={isUpdatingPermissions || isMe} // Khud ko remove hone se bachana
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${isEditor
                                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                                : "bg-primary text-primary-foreground hover:opacity-90"
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {isEditor ? "Remove" : "Add"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            )}


            {/* NEW: DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {showConfirmDelete && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6 text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
                                    <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                                </div>
                                <h2 className="font-semibold text-lg text-foreground">Delete Document?</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Are you sure you want to delete this document? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3 p-4 bg-secondary/30 border-t border-border">
                                <button
                                    onClick={() => setShowConfirmDelete(false)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 text-sm font-semibold bg-background border border-border hover:bg-accent rounded-lg transition-all text-muted-foreground shadow-sm disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
                                >
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