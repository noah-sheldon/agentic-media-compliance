# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is an AML (Anti-Money Laundering) compliance screening system with two main components:

1. **Python Backend** (`/` root): Agentic AML screening pipeline using OpenAI Agents framework
2. **Next.js Frontend** (`/app/`): React-based UI for screening results

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

### Next.js Frontend (from /app directory)
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

## Development Environment

- Python virtual environment: `.venv/`
- Environment variables: `.env` file required
- Test configuration: `pytest.ini` sets pythonpath to project root
- Dependencies: `requirements.txt` includes OpenAI Agents framework

## Key Files

- `main.py`: Entry point demonstrating pipeline usage
- `pipeline/orchestrator.py:35`: Main screening orchestration function
- `tests/test_screening_pipeline.py`: Integration tests with dataset
- `config.py`: Model configuration
- `logging_config.py`: Logging setup

The system processes a subject (name, DOB) and article URL through multiple specialized agents to produce a comprehensive AML screening decision with detailed analysis.