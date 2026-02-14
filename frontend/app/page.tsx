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
  ExternalLink,
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

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
};

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [qaResult, setQaResult] = useState<QuestionResponse | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | '' }>({ text: '', type: '' });

  useEffect(() => {
    fetchDocuments();
  }, []);

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
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="relative">
        <div className="absolute top-0 right-0">
          <Link
            href="/status"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-all bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-indigo-500/30"
          >
            <Activity size={16} /> System Status
          </Link>
        </div>
        <motion.h1 variants={itemVariants}>Private Knowledge Q&A</motion.h1>
        <motion.p variants={itemVariants}>
          Upload your documents and ask anything. Your private knowledge, powered by AI.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* A. Upload Document */}
        <motion.section variants={itemVariants}>
          <h2><Upload size={20} /> Upload Knowledge</h2>
          <div className="relative group">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".txt"
              onChange={handleUpload}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all
                ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500 hover:bg-white/5'}
                ${message.type === 'error' ? 'border-red-500/50' : 'border-white/10'}
              `}
              style={{ borderStyle: 'dashed', borderWidth: '2px' }}
            >
              <Upload className={`mb-3 ${uploading ? 'animate-bounce' : 'group-hover:text-indigo-400'}`} />
              <span className="text-sm font-medium">
                {uploading ? 'Processing Document...' : 'Click to upload or drag & drop .txt file'}
              </span>
            </label>
          </div>

          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-center gap-2 mt-4 text-sm font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* B. Document List */}
        <motion.section variants={itemVariants}>
          <h2><FileText size={20} /> Knowledge Base</h2>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-slate-500 italic">
              No documents in your knowledge base yet.
            </div>
          ) : (
            <ul className="document-list">
              <AnimatePresence mode="popLayout">
                {documents.map((doc) => (
                  <motion.li
                    key={doc.id}
                    className="document-item"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="doc-info">
                      <h3>{doc.fileName}</h3>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button className="delete-btn" onClick={() => handleDelete(doc.id)} title="Remove knowledge">
                      <Trash2 size={18} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>

        {/* C. Ask Question */}
        <motion.section variants={itemVariants}>
          <h2><MessageSquareQuote size={20} /> Ask Your Knowledge</h2>
          <div className="q-box">
            <textarea
              placeholder="What would you like to know about your documents?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !asking && question.trim()) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAsk}
              disabled={asking || !question.trim()}
              className="px-8"
            >
              {asking ? (
                <>Searching Knowledge...</>
              ) : (
                <>Ask Question <Send size={16} /></>
              )}
            </button>
          </div>

          <AnimatePresence>
            {qaResult && (
              <motion.div
                className="answer-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="answer-header">
                  <Search size={18} /> Found Information
                </div>
                <div className="answer-text">
                  {qaResult.answer}
                </div>

                <div className="source-badges">
                  <div className="badge">
                    <span className="badge-label">SOURCE</span>
                    <FileText size={14} /> {qaResult.sourceDocument}
                  </div>
                </div>

                <div className="snippet-container">
                  <div className="snippet-title">Reference Snippet</div>
                  <div className="snippet-text">
                    "{qaResult.sourceSnippet}"
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>
    </motion.main>
  );
}
