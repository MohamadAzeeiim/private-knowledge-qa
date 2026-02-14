"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Trash2,
  Send,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquareQuote,
  Activity
} from "lucide-react";
import Link from "next/link";
import { API_URL } from "./config";

interface Document {
  id: string;
  fileName: string;
  createdAt: string;
}

interface QuestionResponse {
  answer: string;
  sourceDocument: string;
  sourceSnippet: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [qaResult, setQaResult] = useState<QuestionResponse | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | '' }>({ text: '', type: '' });

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Success message timeout
  useEffect(() => {
    if (message.text && message.type === 'success') {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
        setSelectedFileName("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      setMessage({ text: "Please upload only .txt files.", type: 'error' });
      return;
    }

    setUploading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/documents`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage({ text: "Document uploaded successfully!", type: 'success' });
        fetchDocuments();
      } else {
        const error = await res.text();
        setMessage({ text: `Upload failed: ${error}`, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Error connecting to backend.", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDocuments();
        // Clear upload status on any deletion to keep UI fresh
        setMessage({ text: '', type: '' });
        setSelectedFileName("");
      }
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;

    setAsking(true);
    setQaResult(null);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (res.ok) {
        const result = await res.json();
        setQaResult(result);
      } else {
        const error = await res.text();
        setMessage({ text: `Error: ${error}`, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Failed to connect to backend.", type: 'error' });
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="container">
      <header>
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Private Knowledge Q&A
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Your private knowledge, powered by AI. Fits in your viewport.
          </motion.p>
        </div>
        <Link
          href="/status"
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-all bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-indigo-500/30"
        >
          <Activity size={16} /> System Status
        </Link>
      </header>

      <div className="dashboard-grid">
        {/* Left Column: Management */}
        <div className="scroll-container">
          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <h2><Upload size={18} /> Add Knowledge</h2>
            <div className={`p-3 bg-white/5 border border-white/10 rounded-xl transition-all ${message.type === 'error' ? 'border-red-500/30' : ''}`}>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: 'none' }}
                  accept=".txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                      handleUpload(e);
                    }
                  }}
                  disabled={uploading}
                />
                <button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-all whitespace-nowrap shadow-lg shadow-indigo-500/20"
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Selected Knowledge</div>
                  <div className="text-sm truncate font-medium text-slate-200">
                    {selectedFileName || <span className="text-slate-600 italic">No file chosen</span>}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center gap-2 mt-3 text-xs font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="flex-1"
          >
            <h2><FileText size={18} /> Knowledge Base</h2>
            {documents.length === 0 ? (
              <div className="text-center py-4 text-slate-500 italic text-sm">
                No documents found.
              </div>
            ) : (
              <ul className="document-list" style={{ gridTemplateColumns: '1fr' }}>
                <AnimatePresence mode="popLayout">
                  {documents.map((doc) => (
                    <motion.li
                      key={doc.id}
                      className="document-item"
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={{ padding: '0.75rem 1rem' }}
                    >
                      <div className="doc-info">
                        <h3 className="text-sm">{doc.fileName}</h3>
                        <span className="text-xs opacity-50">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button className="delete-btn p-1" onClick={() => handleDelete(doc.id)} title="Remove knowledge">
                        <Trash2 size={14} />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </motion.section>
        </div>

        {/* Right Column: Q&A */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          <motion.section
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <h2><MessageSquareQuote size={18} /> Ask Your Knowledge</h2>
            <div className="q-box">
              <textarea
                placeholder="What would you like to know?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !asking && question.trim()) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                className="text-sm"
              />
            </div>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAsk}
                disabled={asking || !question.trim()}
                className="px-6 py-2 text-sm"
              >
                {asking ? 'Searching...' : 'Ask Question'}
              </button>
            </div>

            <AnimatePresence>
              {qaResult && (
                <motion.div
                  className="answer-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="answer-header text-sm">
                    <Search size={16} /> Found Information
                  </div>
                  <div className="answer-text text-sm">
                    {qaResult.answer}
                  </div>

                  <div className="source-badges">
                    <div className="badge text-[10px] py-1 px-3">
                      <span className="badge-label">SOURCE</span>
                      <FileText size={12} /> {qaResult.sourceDocument}
                    </div>
                  </div>

                  <div className="snippet-container mt-3 p-3">
                    <div className="snippet-title text-[10px]">Snippet</div>
                    <div className="snippet-text text-xs">
                      "{qaResult.sourceSnippet}"
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
