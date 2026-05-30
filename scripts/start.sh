#!/usr/bin/env bash
# start.sh — Launch Gnosis backend and frontend in development mode
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Backend ──────────────────────────────────────────────────────────────────
echo ">>> Starting backend..."
cd "$ROOT/backend"

if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python -m venv .venv
fi

source .venv/bin/activate

echo "Installing backend dependencies..."
pip install -q fastapi uvicorn sqlalchemy chromadb anthropic pypdf \
  python-multipart mcp pydantic-settings

echo "Seeding demo data (skipped if already seeded)..."
python "$ROOT/scripts/seed_demo.py"

uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "Backend running (PID $BACKEND_PID) on http://localhost:8000"

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ">>> Starting frontend..."
cd "$ROOT/frontend"

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

npm run dev &
FRONTEND_PID=$!
echo "Frontend running (PID $FRONTEND_PID) on http://localhost:5173"

# ── Cleanup ──────────────────────────────────────────────────────────────────
trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT INT TERM
wait
