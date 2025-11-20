import json
import os
import re


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return text.strip("_")


def save_result(case: dict, output: dict):
    """
    Saves results grouped by subject name:

        tests/results/<subject>.json

    Each file will contain a list of test runs for that subject.
    """

    # Determine main subject
    subjects = case.get("subject_names", [])
    subject_name = subjects[0] if subjects else "unknown_subject"
    subject_slug = slugify(subject_name)

    # File path
    folder = os.path.join("tests", "results")
    os.makedirs(folder, exist_ok=True)

    filepath = os.path.join(folder, f"{subject_slug}.json")

    # Load existing file or start new array
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            try:
                existing = json.load(f)
            except json.JSONDecodeError:
                existing = []
    else:
        existing = []

    # Append new entry
    entry = {
        "title": case["title"],
        "input": case,
        "output": output
    }
    existing.append(entry)

    # Save back to file
    with open(filepath, "w") as f:
        json.dump(existing, f, indent=2)

    print(f"[saved] {filepath}")
