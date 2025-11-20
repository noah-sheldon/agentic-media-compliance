# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is an AML (Anti-Money Laundering) compliance screening system with two main components:

1. **Python Backend** (`/backend/`): FastAPI service with agentic AML screening pipeline using OpenAI Agents framework
2. **Next.js Frontend** (`/frontend/`): React-based UI for screening results

### Core Architecture

The Python backend uses a multi-agent architecture orchestrated through `pipeline/orchestrator.py:35`. The main entry point `run_screening()` coordinates specialist agents:

- **Article Processing**: `scraping/fetcher.py` extracts article content
- **Specialist Agents** (`aml_agents/`): Each handles specific screening aspects
  - `name_agent.py`: Name matching analysis
  - `dob_agent.py`: Date of birth verification  
  - `sentiment_agent.py`: Content sentiment analysis
  - `decision_agent.py`: Final screening decision
  - `article_metadata_agent.py`: Article metadata extraction
  - `person_agent.py`: Person entity extraction
  - `context_agent.py`: Context analysis
- **Data Models** (`models/`): Pydantic models for structured agent outputs
- **Pipeline** (`pipeline/`): Orchestrates the multi-agent workflow

## Common Commands

### Python Backend
```bash
# Run main screening pipeline
python main.py

# Run tests
pytest

# Run specific test
pytest tests/test_screening_pipeline.py

# Install dependencies
pip install -r requirements.txt
```

### Next.js Frontend (from /frontend directory)
```bash
# Development server  
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Docker
```bash
# Build and run both services
docker-compose up --build

# Backend only
docker build -t backend . && docker run -p 8000:8000 --env-file .env backend

# Frontend only
docker build -t frontend ./frontend && docker run -p 3000:3000 frontend
```

## Development Environment

- Environment variables: `.env` file required in root
- Backend dependencies: `backend/requirements.txt` includes OpenAI Agents framework
- Frontend dependencies: `frontend/package.json` with Next.js and Tailwind CSS
- Test configuration: `backend/pytest.ini` sets pythonpath to project root

## Key Files

- `backend/main.py`: FastAPI entry point with API endpoints
- `backend/pipeline/orchestrator.py:35`: Main screening orchestration function
- `backend/tests/test_screening_pipeline.py`: Integration tests with dataset
- `backend/config.py`: Model configuration
- `backend/logging_config.py`: Logging setup
- `frontend/src/`: Next.js app with UI components

The system processes a subject (name, DOB) and article URL through multiple specialized agents to produce a comprehensive AML screening decision with detailed analysis.