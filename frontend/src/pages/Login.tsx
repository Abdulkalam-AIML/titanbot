import { Button } from "../components/ui/button"
import { Brain } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import React from "react"
import MatrixRain from "../components/MatrixRain"

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    // ... existing state ...
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        // ... existing Google login ...
        console.log("Mocking Google Login...");
        const mockToken = "mock_google_token_123";
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: mockToken }),
            });
            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                window.location.href = "/chat";
            } else {
                alert("Login failed");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to connect to backend. Make sure it's running.");
        }
    };

    // ... existing Apple login ...
    const handleAppleLogin = async () => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
        try {
            const response = await fetch(`${API_BASE_URL}/auth/apple`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identityToken: "mock_apple_token", user: "mock_user" }),
            });
            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                window.location.href = "/chat";
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ... existing Email auth ...
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = isLogin ? "/auth/login" : "/auth/register";
        const body = isLogin ? { email, password } : { email, password, full_name: fullName };

        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (response.ok && data.access_token) {
                localStorage.setItem("token", data.access_token);
                window.location.href = "/chat";
            } else {
                alert(data.detail || "Authentication failed");
            }
        } catch (err) {
            console.error(err);
            alert("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black overflow-hidden relative">
            <MatrixRain />

            {/* Ambient Background Animation (Overlay) */}
            <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 pointer-events-none"
                animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear",
                }}
            />

            {/* Floating Assets */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.img
                    src="/assets/neon_lotus.png"
                    alt="Cyberpunk Lotus"
                    className="absolute top-1/4 left-[10%] w-[300px] h-auto opacity-40 blur-[2px] mix-blend-screen"
                    animate={{
                        y: [-20, 20, -20],
                        rotate: [0, 5, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.img
                    src="/assets/cyber_fox.png"
                    alt="Cybernetic Fox"
                    className="absolute bottom-1/4 right-[10%] w-[250px] h-auto opacity-30 blur-[1px] mix-blend-lighten"
                    animate={{
                        y: [20, -20, 20],
                        rotate: [0, -5, 0],
                        scale: [1, 1.05, 1]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex w-full max-w-sm flex-col items-center space-y-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 shadow-2xl text-card-foreground"
            >
                <div className="flex flex-col items-center space-y-4">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="rounded-full bg-primary/20 p-4 ring-1 ring-primary/50"
                    >
                        <Brain className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </motion.div>
                    <div className="text-center space-y-1">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                        >
                            TitanBot
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-sm text-muted-foreground"
                        >
                            Your advanced AI workspace
                        </motion.p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex w-full bg-secondary/50 p-1 rounded-lg">
                    <button
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${isLogin ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!isLogin ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="w-full space-y-4">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground ml-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                    </Button>
                </form>

                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground/70">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="w-full space-y-3">
                    <Button
                        className="w-full group relative overflow-hidden transition-all hover:bg-zinc-800 bg-zinc-900 border-zinc-800"
                        variant="outline"
                        onClick={handleAppleLogin}
                    >
                        <svg className="mr-2 h-4 w-4 fill-white" viewBox="0 0 24 24">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C5.81 18.23 2.5 13.56 5.17 8.3c1.36-2.6 3.73-3.13 4.96-3.07 1.05.06 2 .46 2.65.46.61 0 1.8-.46 3.03-.4 2.15.11 3.56 1.15 4.3 2.19-3.79 1.87-3.16 6.94.8 8.65-.58 1.4-1.4 2.82-2.67 4.15l-.03.04-.17-.04zM12.03 5.1c-.13-1.8 1.34-3.53 2.94-3.63.15 1.63-1.37 3.45-2.94 3.63z" />
                        </svg>
                        Continue with Apple
                    </Button>

                    <Button
                        className="w-full group relative overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        variant="outline"
                        onClick={handleGoogleLogin}
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
