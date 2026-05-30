# Gnosis

**Gnosis** is an AI-powered personal knowledge management and learning platform. Upload your documents, notes, and course materials; Gnosis indexes them into a vector store and gives you a Socratic AI tutor that surfaces gaps in your understanding, generates summaries, and tracks your progress over time.

## Features

- **Document Ingestion** — Upload PDFs, Markdown, and text files; chunked and embedded into ChromaDB
- **Socratic Tutor** — Claude-powered conversational tutor that asks guiding questions rather than just giving answers
- **Gap Detector** — Analyzes your notes against source material to surface knowledge gaps
- **Summary Writer** — Generates concise summaries of any course or document cluster
- **Progress Tracking** — Tracks quiz scores, review sessions, and mastery per topic
- **MCP Server** — Exposes tools over the Model Context Protocol for integration with Claude Desktop and other MCP clients

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11+, FastAPI, SQLAlchemy, ChromaDB |
| AI | Anthropic Claude (via `anthropic` SDK) |
| Vector Store | ChromaDB (local persistence) |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| MCP | `mcp` Python SDK |

## Project Structure

```
gnosis/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings from environment
│   ├── database.py          # SQLAlchemy models + session
│   ├── vector_store.py      # ChromaDB wrapper
│   ├── document_processor.py# Chunking + embedding pipeline
│   ├── api/                 # Route handlers
│   ├── mcp/                 # MCP server + tools
│   ├── prompts/             # Prompt builders
│   └── data/                # SQLite DB, chroma/, uploads/
├── frontend/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page-level components
│       ├── hooks/           # Custom React hooks
│       └── lib/             # API client, types, utils
└── scripts/
    ├── seed_demo.py         # Load demo data
    └── start.sh             # Dev startup script
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- An Anthropic API key

### 1. Clone & configure

```bash
git clone https://github.com/you/gnosis.git
cd gnosis
cp .env .env.local   # edit with your keys
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy chromadb anthropic pypdf python-multipart mcp
uvicorn main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. (Optional) Seed demo data

```bash
cd scripts
python seed_demo.py
```

API docs available at `http://localhost:8000/docs`.

## MCP Integration

Start the MCP server:

```bash
python backend/mcp/server.py
```

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gnosis": {
      "command": "python",
      "args": ["/path/to/gnosis/backend/mcp/server.py"]
    }
  }
}
```

## License

MIT
