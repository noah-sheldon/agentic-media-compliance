import json
from pathlib import Path
from typing import Any, Dict, List


RESULTS_DIR = Path(__file__).resolve().parent.parent / "tests" / "results"


def load_all_test_results() -> List[Dict[str, Any]]:
    """
    Load every cached screening snapshot stored in tests/results/*.json.
    Returns a flat list so the UI can render cards per test case.
    """

    if not RESULTS_DIR.exists():
        return []

    aggregated: List[Dict[str, Any]] = []
    for file_path in sorted(RESULTS_DIR.glob("*.json")):
        try:
            with file_path.open("r") as f:
                payload = json.load(f)
        except json.JSONDecodeError:
            continue

        if not isinstance(payload, list):
            continue

        for idx, entry in enumerate(payload):
            aggregated.append(
                {
                    "subject_slug": file_path.stem,
                    "source_file": file_path.name,
                    "record_index": idx,
                    **entry,
                }
            )
    return aggregated
