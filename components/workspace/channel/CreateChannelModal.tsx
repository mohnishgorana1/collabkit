"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Loader2, Hash, SquareKanban, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { createChannel } from "@/lib/actions/channel.actions";
import toast from "react-hot-toast";

type ChannelType = "CHAT" | "TASKS" | "DOCS";

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    defaultType?: ChannelType;
    onSuccess: () => void;
}

export default function CreateChannelModal({ isOpen, onClose, workspaceId, defaultType = "CHAT", onSuccess }: CreateChannelModalProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [type, setType] = useState<ChannelType>(defaultType);
    const [description, setDescription] = useState("");
    const [taskPrefix, setTaskPrefix] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await createChannel({
            workspaceId,
            name,
            type,
            description,
            taskPrefix: type === "TASKS" ? taskPrefix : undefined,
        });

        if (res.success) {
            toast.success("Channel created!");
            setName("");
            setDescription("");
            setTaskPrefix("");
            onSuccess();
            onClose();
        } else {
            toast.error(res.error || "Something went wrong");
        }
        setLoading(false);
    };

    const inputStyles = "w-full px-4 py-3 rounded-xl border border-border bg-black/5 dark:bg-white/5 focus:bg-background focus:ring-[3px] focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60 text-sm font-medium";


    useEffect(() => setMounted(true), []);

    // Update default type if it changes via props
    useEffect(() => {
        if (isOpen) setType(defaultType);
    }, [isOpen, defaultType]);


    return (
        <>
            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }} onClick={onClose}
                                className="absolute inset-0 bg-background/20 backdrop-blur-sm"
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                                className={cn("relative p-0 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden bg-card/90 backdrop-blur-2xl border border-border shadow-2xl rounded-3xl")}
                            >
                                {/* Header */}
                                <div className="relative px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
                                    <button onClick={onClose} className="btn absolute top-6 right-6 p-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-foreground transition-colors active:scale-90 z-10">
                                        <X size={18} />
                                    </button>
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">Create Channel</h2>
                                </div>

                                {/* Body (Scrollable Form) */}
                                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-thin-scrollbar px-6 py-6 space-y-5">

                                    {/* Channel Type Selector */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground/80 px-1 uppercase tracking-wider">Channel Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <TypeSelectOption selected={type} value="CHAT" icon={Hash} label="Chat" onClick={() => setType("CHAT")} />
                                            <TypeSelectOption selected={type} value="TASKS" icon={SquareKanban} label="Board" onClick={() => setType("TASKS")} />
                                            <TypeSelectOption selected={type} value="DOCS" icon={FileText} label="Doc" onClick={() => setType("DOCS")} />
                                        </div>
                                    </div>

                                    {/* Channel Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground/80 px-1 uppercase tracking-wider">Name <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                                                {type === "CHAT" ? "#" : type === "TASKS" ? "📋" : "📝"}
                                            </span>
                                            <input type="text" required value={name} onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder={type === "CHAT" ? "e.g. bug-reports" : "e.g. Sprint-1"} className={cn(inputStyles, "pl-10")} />
                                        </div>
                                    </div>

                                    {/* Task Prefix (Conditional) */}
                                    <AnimatePresence>
                                        {type === "TASKS" && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                                                <label className="text-xs font-semibold text-foreground/80 px-1 uppercase tracking-wider">Task Prefix <span className="text-red-500">*</span></label>
                                                <input type="text" required value={taskPrefix} onChange={(e) => setTaskPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))} placeholder="e.g. DES" className={inputStyles} />
                                                <p className="text-[11px] text-muted-foreground px-1">Used for ticket IDs (e.g., DES-1, DES-2). Max 5 chars.</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground/80 px-1 uppercase tracking-wider">Description <span className="text-muted-foreground font-normal lowercase">(optional)</span></label>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What is this channel about?" className={cn(inputStyles, "resize-none")} />
                                    </div>
                                </form>

                                {/* Footer */}
                                <div className="p-4 border-t border-border/50 bg-secondary/20 shrink-0">
                                    <button type="submit" disabled={loading || !name} onClick={handleSubmit} className="btn w-full bg-primary text-primary-foreground hover:brightness-110 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.97] disabled:opacity-50">
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Create Channel"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

// Small Helper for the Radio Buttons
const TypeSelectOption = ({ selected, value, icon: Icon, label, onClick }: any) => (
    <div onClick={onClick} className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
        selected === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
    )}>
        <Icon size={20} />
        <span className="text-xs font-bold">{label}</span>
    </div>
);