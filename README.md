# Private Knowledge Q&A – Mini Workspace

## Project Overview
A full-stack web application that allows users to upload private text documents and ask questions based strictly on those documents.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Vanilla CSS.
- **Backend**: ASP.NET Core 8 Web API, Entity Framework Core.
- **Database**: PostgreSQL (Render Free Tier).
- **AI**: OpenRouter (LLM Multiplexer) for flexible model choice (e.g. Llama-3).

## Setup Steps

### Backend
1. Navigate to `/backend`.
2. Configure `OpenAI:ApiKey`, `OpenAI:BaseUrl`, and `OpenAI:Model` in `appsettings.json`.
3. Update `ConnectionStrings:DefaultConnection` with your PostgreSQL connection string.
4. Run migrations: `dotnet ef database update`.
5. Start the API: `dotnet run`.

### Frontend
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000).

## Implemented Features
- **Document Upload**: Multi-file .txt support with validation.
- **Document List**: Metadata view with deletion capability.
- **Strict Q&A**: Answers generated only from uploaded document context.
- **Source Attributions**: Displays the source document and exact snippet used.
- **Health Monitoring**: Real-time status of Backend, Database, and OpenAI connection.
- **Clean Architecture**: Decoupled layers and repository pattern.
- **Global Error Handling**: Consistent JSON error responses.

## Limitations
- Only `.txt` files supported (current scope).
- Large documents are chunked; context length is limited to GPT-4o-mini's window.
- Basic heuristic parsing for source attribution (can be refined with structured outputs).
