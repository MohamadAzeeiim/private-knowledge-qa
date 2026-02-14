/**
 * Centralized API configuration for the Private Knowledge Q&A application.
 * Uses NEXT_PUBLIC_API_URL from environment variables in production (Vercel),
 * and falls back to localhost for local development.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5087";

// Ensure the URL ends with /api for consistency across fetch calls
export const API_URL = `${API_BASE}/api`;
