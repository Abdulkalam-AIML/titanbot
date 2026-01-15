import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Shield, Camera } from "lucide-react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

export default function Profile() {
    const navigate = useNavigate();
    const userEmail = "user@example.com"; // Mock data for now
    const userName = "TitanBot User";

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
            {/* Background Layers */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40"
                style={{ backgroundImage: `url('/src/assets/bg.png')` }}
            />
            <div className="absolute inset-0 z-0 bg-background/60 backdrop-blur-[2px] pointer-events-none" />

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md p-8 bg-card/85 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 text-muted-foreground hover:text-foreground hover:bg-white/10"
                    onClick={() => navigate("/chat")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="flex flex-col items-center space-y-6">
                    <div className="relative group">
                        <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-card ring-offset-2 ring-offset-transparent overflow-hidden">
                            {/* Placeholder Avatar or Initials */}
                            U
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground shadow-md hover:scale-110 transition-transform">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{userName}</h2>
                        <p className="text-sm text-muted-foreground">{userEmail}</p>
                    </div>

                    <div className="w-full space-y-4 pt-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground px-1">
                                <span>Full Name</span>
                                <Button variant="ghost" size="sm" className="h-auto p-0 text-cyan-400 hover:text-cyan-300">Edit</Button>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                                <User className="h-5 w-5 text-purple-400" />
                                <span className="text-gray-200">{userName}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground px-1">Email Address</label>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                                <Mail className="h-5 w-5 text-cyan-400" />
                                <span className="text-gray-200">{userEmail}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground px-1">Account Type</label>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                                <Shield className="h-5 w-5 text-amber-400" />
                                <span className="text-gray-200">Free Tier</span>
                                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Upgrade</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
