# Prompts Used During Development

This document outlines the high-level prompts and directives used to guide the AI in scaffolding and implementing the core features of the Private Knowledge Q&A project.

## 🏗️ Backend & Infrastructure Scaffolding
- "Scaffold an ASP.NET Core 8 Web API using a clean layered architecture (Controllers, Services, Repositories)."
- "Configure Entity Framework Core with PostgreSQL and implement a `Documents` table."
- "Create a `Dockerfile` for the backend suitable for deployment on Render, using multi-stage builds."
- "Implement a global exception handling middleware that returns consistent JSON error responses."

## 🧠 AI / LLM Integration
- "Integrate OpenRouter as the primary LLM gateway using a standardized `HttpClient` service."
- "Implement a RAG (Retrieval-Augment Generation) pipeline that fetches uploaded documents, chunks the text, and constructs a context-aware prompt."
- "Apply strict prompting to the LLM to ensure answers are derived *only* from the provided document context, including source citations and snippets."

## 🧩 Logical Components
- "Implement a basic heuristic chunking logic that splits document content into 800-character segments for context window efficiency."
- "Develop an automated health check service (`/api/status`) that verifies DB connectivity and performs a ping to the LLM API."
- "Configure a production-ready CORS policy that defaults to restrictive origins but allows customization via environment variables."

## 🎨 UI & Layout
- "Build a side-by-side dashboard layout that fits within a single viewport, using internal scrollbars for long lists or answers."
- "Optimize the 'Upload Knowledge' section to be compact, displaying only the 'Choose File' button and the selected filename."
- "Implement a 5-second timeout for success messages to keep the dashboard clean and synchronized with the current workspace state."

## 🔒 Security & Deployment
- "Perform a security audit to identify and remove any hardcoded API keys or database passwords."
- "Generate a `.env.example` template with professional placeholders and helpful setup comments."
- "Update `.gitignore` files to robustly exclude all environment variables, build artifacts, and logs from version control."

---
*Note: Prompts have been condensed for clarity. No sensitive data or API keys were included in any prompts.*
