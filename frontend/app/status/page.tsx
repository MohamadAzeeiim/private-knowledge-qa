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
    hidden: { opacity: 0, y: 10 },
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
        const baseClass = "p-3 rounded-xl mb-3";
        const Icon = type === 'backend' ? Server : type === 'database' ? Database : Brain;

        return (
            <div className={`${baseClass} ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                <Icon size={20} />
            </div>
        );
    };

    return (
        <div className="container">
            <header>
                <div>
                    <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 font-medium mb-2 hover:text-indigo-300 transition-colors text-sm">
                        ← Back to Workspace
                    </Link>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ textAlign: 'left' }}
                    >
                        System Health
                    </motion.h1>
                </div>
            </header>

            <section style={{ flex: 1, minHeight: 0 }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="m-0"><Activity size={18} /> Service Overview</h2>
                    <button
                        onClick={fetchStatus}
                        disabled={loading}
                        className="text-xs py-1.5 px-3"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 mb-6 text-sm"
                        >
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="status-grid">
                    {['backend', 'database', 'llm'].map((service) => (
                        <motion.div
                            key={service}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="status-card border border-white/5 hover:border-white/10 transition-colors"
                        >
                            <StatusIcon
                                val={status ? (status as any)[service] : undefined}
                                type={service as any}
                            />
                            <h3 className="capitalize text-base font-bold mb-1">{service === 'llm' ? 'LLM Engine' : service}</h3>
                            <div className="flex items-center gap-2 font-medium">
                                {loading ? (
                                    <span className="text-slate-500 text-[10px]">Checking...</span>
                                ) : (status as any)?.[service]?.toLowerCase() === "healthy" ? (
                                    <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                                        <ShieldCheck size={12} /> Operational
                                    </span>
                                ) : (
                                    <span className="text-red-400 flex items-center gap-1 text-[10px]">
                                        <AlertTriangle size={12} /> Disconnected
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-slate-500 text-xs mt-4 pb-4"
            >
                Last updated: {new Date().toLocaleTimeString()}
            </motion.div>
        </div>
    );
}
