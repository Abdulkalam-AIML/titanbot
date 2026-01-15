import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Moon, Volume2, Shield, Key, LogOut, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useState } from "react";

export default function Settings() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [sound, setSound] = useState(true);

    const SettingItem = ({ icon: Icon, title, description, action, color = "text-foreground" }: any) => (
        <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className={cn("p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors", color)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-200">{title}</h3>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </div>
            </div>
            {action}
        </div>
    );

    const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
        <div
            className={cn(
                "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out",
                active ? "bg-cyan-600" : "bg-gray-700"
            )}
            onClick={onToggle}
        >
            <div className={cn(
                "w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out",
                active ? "translate-x-6" : "translate-x-0"
            )} />
        </div>
    );

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
            {/* Background Layers */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40"
                style={{ backgroundImage: `url('/src/assets/bg.png')` }}
            />
            <div className="absolute inset-0 z-0 bg-background/60 backdrop-blur-[2px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-2xl h-[80vh] flex flex-col bg-card/85 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center p-6 border-b border-white/10 bg-black/20">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-4 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate("/chat")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Settings</h1>
                        <p className="text-sm text-muted-foreground">Manage your preferences</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {/* Section: General */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">General</h2>
                        <SettingItem
                            icon={Moon}
                            title="Dark Mode"
                            description="Adjust appearance"
                            color="text-purple-400"
                            action={<span className="text-xs text-muted-foreground">Always On</span>}
                        />
                        <SettingItem
                            icon={Bell}
                            title="Notifications"
                            description="Receive updates and alerts"
                            color="text-amber-400"
                            action={<Toggle active={notifications} onToggle={() => setNotifications(!notifications)} />}
                        />
                        <SettingItem
                            icon={Volume2}
                            title="Sound Effects"
                            description="UI interaction sounds"
                            color="text-cyan-400"
                            action={<Toggle active={sound} onToggle={() => setSound(!sound)} />}
                        />
                    </div>

                    {/* Section: Security */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Security</h2>
                        <SettingItem
                            icon={Key}
                            title="API Keys"
                            description="Manage your LLM API keys"
                            color="text-green-400"
                            action={<ChevronRight className="h-5 w-5 text-gray-500" />}
                        />
                        <SettingItem
                            icon={Shield}
                            title="Privacy"
                            description="Data and visibility settings"
                            color="text-blue-400"
                            action={<ChevronRight className="h-5 w-5 text-gray-500" />}
                        />
                    </div>

                    {/* Section: Account */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Account</h2>
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer flex items-center gap-4 text-red-200">
                            <LogOut className="h-5 w-5 text-red-400" />
                            <span className="font-medium">Log Out</span>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
