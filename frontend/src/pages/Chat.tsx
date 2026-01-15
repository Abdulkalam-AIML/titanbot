import { useState, useEffect, useRef } from "react";
import { Send, Plus, MessageSquare, Settings, User, LogOut, Disc, Menu, X, Sparkles, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
}

interface ChatSession {
    id: number;
    title: string;
}

export default function Chat() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load Sessions
    useEffect(() => {
        fetchSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchSessions = async () => {
        try {
            const res = await api.get("/chat/sessions");
            setSessions(res.data);
        } catch (err) {
            console.error("Failed to load sessions", err);
        }
    };

    const loadSession = async (id: number) => {
        setCurrentSessionId(id);
        try {
            const res = await api.get(`/chat/sessions/${id}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to load messages", err);
        }
    };

    const createNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

            const response = await fetch(`${API_BASE_URL}/chat/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMsg.content,
                    session_id: currentSessionId,
                    model: "gemini-pro"
                })
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                navigate("/");
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
                throw new Error(errorData.detail || "Failed to send message");
            }

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMsg: Message = { id: Date.now() + 1, role: "assistant", content: "" };

            setMessages((prev) => [...prev, assistantMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                assistantMsg.content += chunk;

                setMessages((prev) => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...assistantMsg };
                    return newMsgs;
                });
            }

            if (!currentSessionId) {
                // fetchSessions(); // Optimization: Only fetch if needed or update local state
                // Ideally we get the session ID back in headers or first chunk, but for now simple refresh is okay
                fetchSessions();
            }

        } catch (err: any) {
            console.error("Chat error", err);
            const errorMessage = err.message === "Failed to fetch"
                ? "Error: Could not connect to server. Is it running?"
                : `Error: ${err.message || "Something went wrong."}`;

            setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const sidebarVariants = {
        open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
    } as const;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40"
                style={{ backgroundImage: `url('/src/assets/bg.png')` }}
            />
            <div className="absolute inset-0 z-0 bg-background/60 backdrop-blur-[2px] pointer-events-none" />

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={isSidebarOpen ? "open" : "closed"}
                variants={sidebarVariants}
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card/85 backdrop-blur-xl border-r border-border/50 shadow-2xl md:relative md:translate-x-0"
                )}
            >
                <div className="flex h-16 items-center px-6 border-b border-border/50 bg-transparent">
                    <div className="flex items-center gap-2 text-primary">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Disc className="h-6 w-6 text-cyan-400" />
                        </motion.div>
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">TitanBot</span>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto md:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-4">
                    <Button
                        className="w-full justify-start gap-2 bg-gradient-to-r from-cyan-500/80 to-purple-500/80 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg transition-all border border-white/10"
                        onClick={createNewChat}
                    >
                        <Plus className="h-4 w-4" /> New Chat
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">History</h3>
                    <AnimatePresence>
                        {sessions.map((session) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Button
                                    variant={currentSessionId === session.id ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start truncate text-sm font-normal hover:bg-white/10 transition-colors",
                                        currentSessionId === session.id && "bg-white/15 font-medium text-cyan-300 border-l-2 border-cyan-400 rounded-none pl-3"
                                    )}
                                    onClick={() => loadSession(session.id)}
                                >
                                    <MessageSquare className="mr-2 h-4 w-4 opacity-70" />
                                    <span className="truncate">{session.title}</span>
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="border-t border-border/50 p-4 space-y-1 bg-black/20">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 hover:bg-white/10"
                        onClick={() => navigate("/settings")}
                    >
                        <Settings className="h-4 w-4" /> Settings
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 hover:bg-white/10"
                        onClick={() => navigate("/profile")}
                    >
                        <User className="h-4 w-4" /> Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" /> Logout
                    </Button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col h-full relative z-10 bg-transparent">
                {/* Header */}
                <header className="flex h-16 items-center border-b border-white/10 bg-black/20 backdrop-blur-md px-4 sticky top-0 z-20">
                    {!isSidebarOpen && (
                        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                    <div className="flex-1 flex items-center gap-2">
                        {currentSessionId ? (
                            <>
                                <MessageSquare className="h-4 w-4 text-cyan-400" />
                                <h2 className="text-sm font-medium text-gray-200">{sessions.find(s => s.id === currentSessionId)?.title}</h2>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Sparkles className="h-4 w-4 text-cyan-400" />
                                <span className="text-sm">New Conversation</span>
                            </div>
                        )}
                    </div>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10">
                        U
                    </div>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 relative custom-scrollbar">

                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center space-y-8 max-w-2xl mx-auto mt-[-5%]"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/30 to-purple-600/30 blur-2xl rounded-full animate-pulse group-hover:bg-cyan-500/40 transition-all duration-500" />
                                <Zap className="h-20 w-20 text-cyan-400 relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                                    TitanBot
                                </h2>
                                <p className="text-gray-400 text-lg max-w-md mx-auto">
                                    Your advanced AI assistant. Ready to help with code, creativity, and problem-solving.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
                                {[
                                    "Explain quantum computing",
                                    "Write a Python script for...",
                                    "Design a logo concept",
                                    "Debug this error stack..."
                                ].map((suggestion, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        className="h-auto py-4 px-6 justify-start text-left bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300 backdrop-blur-sm group"
                                        onClick={() => setInput(suggestion)}
                                    >
                                        <Sparkles className="mr-3 h-4 w-4 text-cyan-500/50 group-hover:text-cyan-400 transition-colors" />
                                        <span className="truncate">{suggestion}</span>
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className={cn(
                                        "flex w-full group",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[85%] md:max-w-[75%] rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border transition-all duration-300",
                                            msg.role === "user"
                                                ? "bg-gradient-to-br from-cyan-600/90 to-blue-600/90 text-white rounded-br-sm border-cyan-500/20 shadow-cyan-900/20"
                                                : "bg-gray-900/60 text-gray-100 rounded-bl-sm border-white/10 shadow-black/20"
                                        )}
                                    >
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {msg.content.includes("**NOTICE:") ? (
                                                <>
                                                    <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-sm font-medium flex items-center gap-2">
                                                        <Sparkles className="h-4 w-4" />
                                                        <span>{msg.content.split("\n\n")[0].replace(/\*\*/g, "")}</span>
                                                    </div>
                                                    {msg.content.split("\n\n").slice(1).join("\n\n")}
                                                </>
                                            ) : (
                                                msg.content
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                    {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start w-full"
                        >
                            <div className="bg-gray-900/60 border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4 shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-[bounce_1.4s_infinite] [animation-delay:-0.32s]" />
                                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-[bounce_1.4s_infinite] [animation-delay:-0.16s]" />
                                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-[bounce_1.4s_infinite]" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-none border-t border-white/5">
                    <div className="relative flex items-end max-w-4xl mx-auto bg-gray-900/60 rounded-3xl border border-white/10 shadow-xl focus-within:ring-2 focus-within:ring-cyan-500/50 transition-all overflow-hidden p-2 backdrop-blur-md">
                        <textarea
                            className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-500 rounded-3xl min-h-[50px] max-h-[200px] py-3.5 px-6 focus:outline-none resize-none overflow-hidden custom-scrollbar"
                            placeholder="Message TitanBot..."
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            disabled={isLoading}
                            rows={1}
                        />
                        <div className="pb-2 pr-2">
                            <Button
                                size="icon"
                                className={cn(
                                    "h-10 w-10 rounded-full transition-all duration-300 shadow-lg",
                                    input.trim()
                                        ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:shadow-cyan-500/25 hover:scale-105"
                                        : "bg-white/10 text-gray-500 hover:bg-white/20"
                                )}
                                onClick={sendMessage}
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 ml-0.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="text-center mt-4 text-xs text-gray-500 font-medium tracking-wide">
                        Powered by TitanBot AI. Accuracy may vary.
                    </div>
                </div>
            </div>
        </div>
    );
}
