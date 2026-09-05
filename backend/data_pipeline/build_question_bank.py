"""Build the quiz question bank from hand-authored dilemmas.

Offline pipeline, run once:
    uv run python data_pipeline/build_question_bank.py

Output:
    backend/data_pipeline/output/question_bank.json

The bank is curated in data_pipeline/curated_questions.py (24 dilemmas,
2 per dimension, English + Vietnamese). This script validates coverage and
writes the JSON consumed by GET /api/scenarios/random.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

try:
    from data_pipeline.curated_questions import DILEMMAS
except ModuleNotFoundError:  # run as `python data_pipeline/build_question_bank.py`
    from curated_questions import DILEMMAS

BACKEND_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BACKEND_ROOT / "data_pipeline" / "output"
FEATURE_COLUMNS_JSON = OUTPUT_DIR / "feature_columns.json"

REQUIRED_FIELDS = (
    "dimension",
    "outcome_id",
    "choice_a",
    "choice_b",
    "choice_a_vi",
    "choice_b_vi",
    "context_en",
    "context_vi",
)


def load_dimensions() -> list[str]:
    """Return the 12 dimension names from the vectors pipeline output."""
    if FEATURE_COLUMNS_JSON.exists():
        return json.loads(FEATURE_COLUMNS_JSON.read_text(encoding="utf-8"))
    return [
        "Age_Old",
        "Age_Young",
        "Fitness_Fat",
        "Fitness_Fit",
        "Gender_Female",
        "Gender_Male",
        "Social Status_High",
        "Social Status_Low",
        "Species_Hoomans",
        "Species_Pets",
        "Utilitarian_Less",
        "Utilitarian_More",
    ]


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    dimensions = load_dimensions()

    for entry in DILEMMAS:
        missing = [f for f in REQUIRED_FIELDS if not entry.get(f)]
        if missing:
            raise ValueError(f"{entry.get('outcome_id')}: missing {missing}")
        if entry["dimension"] not in dimensions:
            raise ValueError(f"{entry.get('outcome_id')}: bad dimension")

    counts = Counter(entry["dimension"] for entry in DILEMMAS)
    for dim in dimensions:
        print(f"{dim}: {counts.get(dim, 0)} dilemmas")
    if set(counts) != set(dimensions):
        raise ValueError("dimension coverage mismatch")

    out_path = OUTPUT_DIR / "question_bank.json"
    out_path.write_text(json.dumps(DILEMMAS, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved {len(DILEMMAS)} questions to {out_path}")
    # NOTE: No Firebase Storage upload. Publish via GitHub cloud-assets/ instead.


if __name__ == "__main__":
    main()
