# Google AI Open Platform — Demo

A React + TypeScript frontend with a Python FastAPI backend for exploring Google Gemini models.

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- A **Google AI Studio API key** ([get one here](https://aistudio.google.com/app/apikey))

---

## 1. Clone & Enter the Project

```bash
git clone <your-repo-url>
cd <project-folder>
```

---

## 2. Start the Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key
export GOOGLE_API_KEY="your-api-key-here"
# Windows:
set GOOGLE_API_KEY=your-api-key-here

# Run the server
python backend.py
```

Backend will start on **http://localhost:8000**

---

## 3. Start the Frontend

Open a **new terminal** (keep the backend running):

```bash
cd ..          # back to project root
npm install
npm run dev
```

Frontend will start on **http://localhost:8443**

---

## 4. Open in Browser

Go to: **http://localhost:8443**

The frontend automatically fetches available models from the backend.

---

## Project Structure

```
├── backend/
│   ├── main.py              # FastAPI server
│   └── requirements.txt     # Python deps
├── src/
│   ├── App.tsx              # Root layout
│   ├── types.ts             # Shared TypeScript types
│   ├── services/api.ts      # API calls to backend
│   ├── hooks/               # React hooks (useModels, useChat)
│   ├── components/
│   │   ├── ui/              # Reusable UI bits
│   │   └── tools/           # Chat, Vision, Code, etc.
│   └── ...
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `CORS error` in browser | Make sure backend is running before opening frontend |
| `Failed to load models` | Check that `GOOGLE_API_KEY` is set and backend is on port 8000 |
| Port already in use | Change port in `backend/main.py` or frontend `.env` |

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Google Generative AI Python SDK
- **API:** Google Gemini
