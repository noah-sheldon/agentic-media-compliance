import json
import pytest
import os

from pipeline.orchestrator import run_screening
from utils.save_test_result import save_result
from dotenv import load_dotenv

load_dotenv()

# Path to the dataset
DATASET_PATH = os.path.join(
    os.path.dirname(__file__),
    "test_dataset.json"
)

# Load test cases
with open(DATASET_PATH, "r") as f:
    TEST_CASES = json.load(f)


@pytest.mark.parametrize("case", TEST_CASES)
def test_full_screening_pipeline(case):
    """
    Runs the full agentic AML screening pipeline on every dataset entry.
    Saves the full JSON output snapshot for UI inspection.
    """

    subject_name = case["subject_names"][0] if case["subject_names"] else ""
    dob = case["dob_value"]
    url = case["article_link"]

    print(f"\n\n=== RUNNING TEST CASE: {case['title']} ===")
    print(f"Subject: {subject_name} | DOB: {dob} | URL: {url}")

    # ---- Run the actual agent pipeline ----
    result = run_screening(subject_name, dob, url)

    # ---- Save a snapshot for frontend UI ----
    save_result(case, result)

    # ---- Assertions: basic structural checks ----
    assert isinstance(result, dict), "Pipeline output should be a dict"
    # assert "decision" in result, "Final decision missing"
    # assert "is_subject_match" in result
    # assert "overall_risk_label" in result
    # assert "details" in result
    # assert "name_match" in result["details"]
    # assert "dob_age" in result["details"]
    # assert "sentiment" in result["details"]

    print("Decision:", result["decision"])
    print("Risk:", result["overall_risk_label"])
    print("Match:", result["is_subject_match"])
    print("Saved snapshot.\n")
