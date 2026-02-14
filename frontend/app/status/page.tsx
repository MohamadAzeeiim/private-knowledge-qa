"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Database,
    Brain,
    ShieldCheck,
    AlertTriangle,
    RefreshCw,
    Server
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "../config";

interface ServiceStatus {
    backend: string;
    database: string;
    llm: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function StatusPage() {
    const [status, setStatus] = useState<ServiceStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchStatus = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_URL}/status`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            } else {
                setError("Could not retrieve status from backend.");
            }
        } catch (err) {
            setError("Backend is unreachable. Please ensure the API is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const StatusIcon = ({ val, type }: { val?: string, type: 'backend' | 'database' | 'llm' }) => {
        const isHealthy = val?.toLowerCase() === "healthy";
        const baseClass = "p-3 rounded-xl mb-4";
        const Icon = type === 'backend' ? Server : type === 'database' ? Database : Brain;

        return (
            <div className={`${baseClass} ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                <Icon size={24} />
            </div>
        );
    };

    return (
        <motion.main
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <header>
                <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 font-medium mb-8 hover:text-indigo-300 transition-colors">
                    ← Back to Workspace
                </Link>
                <motion.h1 variants={cardVariants}>System Health</motion.h1>
                <motion.p variants={cardVariants}>
                    Real-time status monitoring for our core knowledge services and AI engines.
                </motion.p>
            </header>

            <section>
                <div className="flex justify-between items-center mb-8">
                    <h2><Activity size={20} /> Service Overview</h2>
                    <button
                        onClick={fetchStatus}
                        disabled={loading}
                        className="text-sm py-2 px-4"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-8"
                        >
                            <AlertTriangle size={20} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="status-grid">
                    {['backend', 'database', 'llm'].map((service) => (
                        <motion.div
                            key={service}
                            variants={cardVariants}
                            className="status-card border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <div className="flex flex-col items-center">
                                <StatusIcon
                                    val={status ? (status as any)[service] : undefined}
                                    type={service as any}
                                />
                                <h3 className="capitalize text-lg font-bold mb-2">{service === 'llm' ? 'LLM Engine' : service}</h3>
                                <div className="flex items-center gap-2 font-medium">
                                    {loading ? (
                                        <span className="text-slate-500 text-sm">Checking...</span>
                                    ) : (status as any)?.[service]?.toLowerCase() === "healthy" ? (
                                        <span className="text-emerald-400 flex items-center gap-1 text-sm">
                                            <ShieldCheck size={14} /> Operational
                                        </span>
                                    ) : (
                                        <span className="text-red-400 flex items-center gap-1 text-sm">
                                            <AlertTriangle size={14} /> Disconnected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <motion.div
                variants={cardVariants}
                className="text-center text-slate-500 text-sm mt-8"
            >
                Last updated: {new Date().toLocaleTimeString()}
            </motion.div>
        </motion.main>
    );
}
