"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Loader2, User } from "lucide-react";
import { createMessage } from "@/lib/actions/message.actions";
import toast from "react-hot-toast";
import Image from "next/image";
import { getPusherClient } from "@/lib/pusher";

export default function ChatBox({ initialMessages = [], workspaceId, channelId, currentUserId }: any) {
    const [messages, setMessages] = useState<any[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. init pusher client
        const pusher = getPusherClient()

        // 2. channel ko subscribe kro
        const channel = pusher.subscribe(channelId);

        // 3. wait for new message
        channel.bind("new-message", (incomingMessage: any) => {
            setMessages((prev) => {
                // 💡 Duplicate Check 1: Real ID match
                const messageExists = prev.find((msg) => msg._id === incomingMessage._id);
                if (messageExists) return prev;

                // 💡 Duplicate Check 2 (OPTIMISTIC FIX):
                // Agar HTTP response aane se pehle Pusher se message aagaya, 
                // toh hum temp message ko replace kar denge taaki do-do message na dikhein.
                const tempIndex = prev.findIndex(m => String(m._id).startsWith("temp-") && m.content === incomingMessage.content);
                if (tempIndex !== -1) {
                    const newMsgs = [...prev];
                    newMsgs[tempIndex] = incomingMessage;
                    return newMsgs;
                }

                return [...prev, incomingMessage]
            })
        })

        // 4. cleanup 
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        }
    }, [channelId])


    // Auto-scroll to bottom whenever new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const content = newMessage;
        setNewMessage(""); // ⚡ Instantly clear input

        // 💡 OPTIMISTIC UI: Create a temporary fake message
        const tempId = `temp-${Date.now()}`;
        
        // Puraani chat se current user ka photo/naam nikalne ki koshish (for UI)
        const myPrevMsg = messages.find((m) => m.senderId._id === currentUserId);
        
        const optimisticMessage = {
            _id: tempId,
            content: content,
            senderId: myPrevMsg ? myPrevMsg.senderId : { _id: currentUserId, firstName: "You", lastName: "", avatarUrl: "" },
            createdAt: new Date().toISOString(),
            isOptimistic: true, // Yeh flag UI mein styling handle karega
        };

        // ⚡ Instantly append fake message to UI
        setMessages((prev) => [...prev, optimisticMessage]);
        setIsSending(true);

        try {
            // Background API Call
            const res = await createMessage({
                workspaceId,
                channelId,
                content,
            });

            if (res.success) {
                // ⚡ Swap the fake message with the Real message from database
                setMessages((prev) => prev.map((msg) => msg._id === tempId ? res.message : msg));
            } else {
                toast.error("Failed to send message");
                // Rollback: Hata do fake message
                setMessages((prev) => prev.filter(msg => msg._id !== tempId));
                setNewMessage(content); 
            }
        } catch (error) {
            toast.error("Error sending message");
            setMessages((prev) => prev.filter(msg => msg._id !== tempId));
            setNewMessage(content);
        }
        setIsSending(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">

            {/* --- MESSAGE LIST AREA --- */}
            <div className="flex-1 overflow-y-auto p-4 custom-thin-scrollbar flex flex-col gap-4" ref={scrollRef}>
                {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
                        <span className="text-4xl">👋</span>
                        <p>Welcome to the beginning of this channel!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId._id === currentUserId;

                        return (
                            <div key={msg._id} className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>

                                {/* Avatar */}
                                <div className="w-8 h-8 bg-secondary border border-border/50 shrink-0 flex items-center justify-center overflow-hidden rounded-full">
                                    {msg.senderId.avatarUrl ? (
                                        <Image
                                            width={100}
                                            height={100}
                                            src={msg.senderId.avatarUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <User size={14} className="text-muted-foreground" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-semibold text-foreground/80">
                                            {msg.senderId.firstName} {msg.senderId.lastName}
                                        </span>
                                        <span suppressHydrationWarning className="text-[10px] text-muted-foreground">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {/* 💡 isOptimistic flag se opacity control ho rahi hai */}
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm transition-all duration-300 ${
                                            isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-secondary text-foreground rounded-tl-none border border-border/50"
                                        } ${msg.isOptimistic ? "opacity-60" : "opacity-100"}`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* --- INPUT AREA --- */}
            <div className="p-4 bg-background shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-secondary/30 border border-border/50 rounded-xl p-2 focus-within:border-primary/50 transition-colors">

                    <button type="button" className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        <Paperclip size={18} />
                    </button>

                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="Message this channel..."
                        className="flex-1 max-h-32 bg-transparent resize-none outline-none text-sm py-2 custom-thin-scrollbar"
                        rows={1}
                    />

                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:bg-secondary disabled:text-muted-foreground transition-colors shrink-0"
                    >
                        {/* Send button mein se loader hata diya taaki instantly bheja ja sake */}
                        <Send size={16} />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-muted-foreground"><strong>Return</strong> to send, <strong>Shift + Return</strong> to add a new line.</span>
                </div>
            </div>
        </div>
    );
}