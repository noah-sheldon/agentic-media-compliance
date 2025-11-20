import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from logging_config import setup_logging
from pipeline.orchestrator import run_screening
from utils.test_results import load_all_test_results

load_dotenv()
setup_logging()

APP_NAME = "Adverse Media Agent Service"
API_PREFIX = "/api"

app = FastAPI(
    title=APP_NAME,
    description="Multi-agent AML adverse media screening API.",
    version="0.1.0",
)

allowed_origins = os.environ.get("API_CORS_ORIGINS", "*")
if allowed_origins == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScreeningPayload(BaseModel):
    name: str
    url: str
    dob: Optional[str] = None


@app.get(f"{API_PREFIX}/health")
async def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


@app.post(f"{API_PREFIX}/run_screening")
async def run_screening_endpoint(payload: ScreeningPayload) -> Dict[str, Any]:
    try:
        result = await run_screening(payload.name, payload.dob, payload.url)
    except Exception as exc:  # pragma: no cover - FastAPI handles propagation
        raise HTTPException(status_code=500, detail=f"Screening failed: {exc}") from exc
    return result


@app.get(f"{API_PREFIX}/tests")
async def list_test_results() -> Dict[str, List[Dict[str, Any]]]:
    return {"results": load_all_test_results()}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    reload = os.environ.get("API_RELOAD", "false").lower() == "true"
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload)
