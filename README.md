# Agentic Media Compliance

Multi-agent AML adverse media screening tool with a FastAPI backend and a Next.js + shadcn UI. Analysts submit a subject name, optional DOB, and an article URL to receive an auditable verdict. A separate **Tests** view visualises curated regression cases stored under `backend/tests/results`.

## Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start (Docker)](#quick-start-docker)
3. [Manual Setup](#manual-setup)
4. [Backend Reference](#backend-reference)
5. [Frontend Reference](#frontend-reference)
6. [Regression Tests](#regression-tests)
7. [Screenshots](#screenshots)
8. [Missing Data Enrichment Strategy (Part 2)](#missing-data-enrichment-strategy-part-2)
9. [Known Gaps / Future Work](#known-gaps--future-work)

---

## Architecture Overview

```
backend/   # FastAPI + OpenAI Agents pipeline, scraping helpers, logging
frontend/  # Next.js 14 App Router UI styled with shadcn + Tailwind
docker-compose.yml  # Spins up backend + frontend together
```

Agents:

- Article metadata, person, context, name match, DOB/age, sentiment, final decision.
- Final response includes audit notes + a “details” object so the UI can drill down by dimension.

## Quick Start (Docker)

```bash
git clone https://github.com/noah-sheldon/agentic-media-compliance.git
cd agentic-media-compliance

# Populate backend/.env with OPENAI_API_KEY, AML_SCREENING_MODEL etc.
cat <<'EOF' > backend/.env
OPENAI_API_KEY=sk-your-key
AML_SCREENING_MODEL=gpt-4.1-mini
API_CORS_ORIGINS=http://localhost:3000
EOF

docker compose up --build
```

- Backend: http://localhost:8000 (FastAPI docs at `/docs`, health at `/api/health`)
- Frontend: http://localhost:3000 (Screening UI + Tests gallery)

Environment variables for docker compose:

- `backend/.env` – `OPENAI_API_KEY`, `AML_SCREENING_MODEL`, `API_CORS_ORIGINS`
- `frontend` service consumes `NEXT_PUBLIC_API_BASE` (set in `docker-compose.yml`)

## Manual Setup

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...        # REQUIRED
export AML_SCREENING_MODEL=gpt-4.1-mini  # optional
export API_CORS_ORIGINS="http://localhost:3000"
uvicorn main:app --reload
```

Key endpoints:

- `POST /api/run_screening` – Body `{name, url, dob?}` → returns `FinalScreeningDecision` + `details`
- `GET /api/tests` – Reads cached JSON snapshots from `tests/results/*.json`
- `GET /api/health` – Simple liveness probe

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE="http://localhost:8000/api" npm run dev
```

Routes:

- `/` – Screening form, results with shadcn cards (risk badges, audit notes, metadata, people, context, name, DOB, sentiment, article text)
- `/tests` – Filterable gallery (search, risk, match, edge case reason) of stored regression outputs

## Backend Reference

- `pipeline/orchestrator.py` – Builds prompts, runs agents via `openai-agents` Runner, aggregates outputs
- `scraping/fetcher.py` – Simple HTML fetcher + cleaner (`scraping/cleaners.py`)
- `utils/test_results.py` – Loads all JSON snapshots for `/api/tests`
- `tests/test_screening_pipeline.py` – Executes entire pipeline for each entry in `tests/test_dataset.json` and saves results to `tests/results/<subject>.json`

Run structural checks (already executed during development):

```bash
cd backend
PYTHONPYCACHEPREFIX=$(pwd)/.pycache_tmp python3 -m py_compile \
    main.py pipeline/orchestrator.py utils/test_results.py
rm -rf .pycache_tmp
```

## Frontend Reference

- `app/layout.tsx`, `app/globals.css` – Shared layout + theme tokens
- `app/page.tsx` – Screening form, state management, result rendering
- `app/tests/page.tsx` – Client-side filtering of regression cases
- `components/screening-result.tsx` – High-level verdict card + detail drill-down
- `components/test-result-card.tsx` – Displays edge-case context vs pipeline verdict side-by-side
- Shadcn primitives under `components/ui/*`

## Regression Tests

The provided dataset (`backend/tests/test_dataset.json`) includes curated edge cases. To refresh results:

```bash
cd backend
pytest tests/test_screening_pipeline.py
```

Each run stores a snapshot under `backend/tests/results/<subject>.json` consumed by `/tests` in the UI. Regenerate these whenever prompts/models change to keep the gallery aligned with reality.

## Screenshots

| Screen | Description |
|--------|-------------|
| ![Screening Input](frontend/public/screening_input.png) | Main screening form where analysts enter subject name, DOB, and article URL |
| ![Results Overview](frontend/public/results_overview.png) | Comprehensive analysis results with risk assessment and decision summary |
| ![Tests UI](frontend/public/tests-ui.png) | Test gallery with pagination, filters, and detailed test case views |
| ![Audit Results](frontend/public/audit_results.png) | Detailed audit trail with agent reasoning and evidence tracking |
| ![Sentiment Analysis](frontend/public/sentiment.png) | Sentiment analysis breakdown with confidence scores |
| ![Article Metadata](frontend/public/metadata_article.png) | Extracted article metadata and context information |

## Missing Data Enrichment Strategy (Part 2)

To automate enrichment when core identifiers (DOB, middle names, occupations, locations) are absent, we propose a multi-tier pipeline:

1. **Attribute Detector** – Flag missing concepts (DOB, middle name, occupation, location) before issuing any search. Example:

   ```ts
   const missing = {
     dob: !articleContainsDOB,
     middleName: !articleContainsMiddleName,
     occupation: !articleContainsOccupation,
     location: !articleContainsLocation,
   };
   ```

2. **Tiered Search Stack**

| Tier | Source Type                | Examples                                                         | Confidence                   |
| ---- | -------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| 1    | Structured knowledge       | Wikipedia, Wikidata, Crunchbase, Companies House (SPARQL / REST) | ≥0.95                        |
| 2    | Professional profiles      | LinkedIn, Bloomberg, PitchBook                                   | 0.85–0.95                    |
| 3    | News archives              | Reuters, BBC, Financial Times                                    | 0.75–0.90                    |
| 4    | Conversational aggregators | Perplexity, You.com, Kagi                                        | 0.80–0.95                    |
| 5    | Public records             | Business filings, voter registers, court records                 | ≥0.90 (jurisdiction-limited) |

- Prefer Perplexity or Serper.dev early to aggregate multiple domains before scraping.

3. **Query Strategy** – LLM generates adaptive queries based on missing attributes and optional subject metadata (country, employer, etc.).

4. **Candidate Processing** – Fetch top N results through a proxy, extract text (Readability/Cheerio), capture titles, URLs, publication dates, and relevant sentences. Hash/cache results to avoid re-fetching.

5. **Entity Extraction** – NER prompt over snippets produces normalized fields (DOB, occupation, location, education, source URL, confidence).

6. **Cross-Verification** – Compare enriched attributes vs article data to adjust confidence (reward matches, penalize conflicts) and compute a weighted score:

   ```
   finalConfidence =
     sourceWeight * sourceReputation +
     attributeConsistency * 0.4 +
     textualEvidence * 0.3;
   ```

7. **Analyst Output** – UI table showing value, source, and confidence, with tooltips for raw snippets and domain reputation. Example:

| Attribute  | Value          | Source        | Confidence |
| ---------- | -------------- | ------------- | ---------- |
| DOB        | 1984-07-21     | wikipedia.org | 0.95       |
| Occupation | CFO – Acme Ltd | linkedin.com  | 0.89       |

8. **Middle Name Discovery** – Query expansions (`"John A. Smith"`, `"John Alexander Smith"`, `alias`, `nickname`) + frequency scoring, then normalized by LLM.

9. **DOB Inference** – Use direct mentions, age references, education dates, and career milestones to triangulate DOB (median of derived values).

10. **Service Architecture** – Dedicated Enrichment Orchestrator:

```
Client Request
   ↓
[ Orchestrator ]
   ↳ Attribute Detector
   ↳ Search Agent (Perplexity → Serper → fallback)
   ↳ Scraper / Parser
   ↳ Entity Extractor (LLM/Regex)
   ↳ Cross-Verifier
   ↳ Cache + Store
   ↳ Output
```

All steps log provenance (URL, timestamp, snippet) for auditability, support rate limiting, and expose TTL-based caching so repeated names don’t trigger redundant work. Low-confidence enrichments can be queued for human review.

## Known Gaps / Future Work

- **Enrichment pipeline not yet implemented** – Only the plan above exists; actual search agents/scrapers need to be built.
- **Auth / RBAC** – API/UI currently unauthenticated; add auth before production.
- **Persistent storage** – Screening results are transient. Consider storing reports + audit trails in a database.
- **Testing** – No automated unit tests beyond the dataset replay. Add mock-based tests covering agent parsing and frontend components.
- **Observability** – Add structured logging/metrics (OpenTelemetry) for agent latency and error tracking.
- **Screenshot assets** – Replace placeholder references in the Screenshots section with real captures under `docs/`.
