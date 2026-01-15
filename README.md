# TitanBot

TitanBot is a production-grade AI chatbot SaaS platform designed for real-world deployment. It features a premium React frontend, a scalable FastAPI backend, and modular LLM integration.

## Features

- **Premium UI/UX**: Modern, responsive design with dark mode, glassmorphism, and smooth animations.
- **Advanced Chat Capabilities**: Streaming responses, context-aware memory, and markdown support.
- **Secure Authentication**: Google OAuth 2.0 integration with JWT session management.
- **Scalable Backend**: Built with FastAPI and SQLAlchemy for robustness and performance.
- **Modular LLM**: Easy integration with OpenAI, Gemini, and other LLM providers.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, ShadCN/UI
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Auth**: Google OAuth 2.0

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values.

## License

MIT
