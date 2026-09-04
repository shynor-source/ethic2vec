"""Build the quiz question bank from Moral Machine responses.

Offline pipeline, run once after build_vectors.py:
    uv run python data_pipeline/build_question_bank.py

Output:
    backend/data_pipeline/output/question_bank.json

Sampling rule per dimension:
    - Filter rows by matching scenario_type.
    - Sort by diff_num_characters ascending to avoid mixing the
      "number of people" axis into other dimensions.
    - Randomly sample 25 rows (seed 42) from the low-diff pool.
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DATASET_DIR = BACKEND_ROOT.parent / "dataset"
OUTPUT_DIR = BACKEND_ROOT / "data_pipeline" / "output"

RESPONSES_CSV = DATASET_DIR / "moral_machine_responses.csv"
FEATURE_COLUMNS_JSON = OUTPUT_DIR / "feature_columns.json"

QUESTIONS_PER_DIMENSION = 25
POOL_SIZE = 2000
RANDOM_STATE = 42

CHARACTER_COLUMNS = [
    "man",
    "woman",
    "pregnant",
    "stroller",
    "old_man",
    "old_woman",
    "boy",
    "girl",
    "homeless",
    "large_woman",
    "large_man",
    "criminal",
    "male_executive",
    "female_executive",
    "female_athlete",
    "male_athlete",
    "female_doctor",
    "male_doctor",
    "dog",
    "cat",
]

CROSSING_LABELS = {
    0: "car continues straight",
    1: "car swerves",
    2: "signal status unknown",
}


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


def scenario_type_of(dimension: str) -> str:
    """Split 'Social Status_High' into scenario_type 'Social Status'."""
    return dimension.rsplit("_", 1)[0]


def describe_characters(row: pd.Series) -> str:
    """Describe one side of a scenario from character counts greater than zero."""
    present = [
        f"{col} x{int(row[col])}" for col in CHARACTER_COLUMNS if int(row[col]) > 0
    ]
    return ", ".join(present) if present else "no characters listed"


def build_entry(dimension: str, row: pd.Series) -> dict:
    """Build one question entry with both choices described."""
    crossing = int(row["crossing_legality"])
    passengers = bool(int(row["is_passengers"]))
    characters = describe_characters(row)
    side = "passengers" if passengers else "pedestrians"
    summary = (
        f"Save {characters} ({side}; {CROSSING_LABELS.get(crossing, 'unknown')}; "
        f"people difference {int(row['diff_num_characters'])}) "
        f"or let the car continue."
    )
    return {
        "dimension": dimension,
        "outcome_id": str(row["outcome_id"]),
        "country": str(row["country"]),
        "scenario_type": str(row["scenario_type"]),
        "character_group": str(row["character_group"]),
        "choice_a": summary,
        "choice_b": "Let the car continue without intervening.",
        "present_characters": {
            col: int(row[col]) for col in CHARACTER_COLUMNS if int(row[col]) > 0
        },
        "crossing_legality": crossing,
        "is_passengers": passengers,
        "num_characters": int(row["num_characters"]),
        "diff_num_characters": int(row["diff_num_characters"]),
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    dimensions = load_dimensions()
    print(f"Building questions for {len(dimensions)} dimensions.")

    needed = [
        "outcome_id",
        "country",
        "scenario_type",
        "character_group",
        "crossing_legality",
        "is_passengers",
        "num_characters",
        "diff_num_characters",
        *CHARACTER_COLUMNS,
    ]
    df = pd.read_csv(RESPONSES_CSV, usecols=needed)

    bank: list[dict] = []
    for dimension in dimensions:
        scenario = scenario_type_of(dimension)
        pool = df[df["scenario_type"] == scenario].copy()
        pool = pool.sort_values(
            ["diff_num_characters", "num_characters"]
        ).head(POOL_SIZE)
        n = min(QUESTIONS_PER_DIMENSION, len(pool))
        sampled = pool.sample(n=n, random_state=RANDOM_STATE)
        for _, row in sampled.iterrows():
            bank.append(build_entry(dimension, row))
        print(f"{dimension}: scenario={scenario} pool={len(pool)} sampled={n}")

    out_path = OUTPUT_DIR / "question_bank.json"
    out_path.write_text(json.dumps(bank, indent=2), encoding="utf-8")
    print(f"Saved {len(bank)} questions to {out_path}")
    # NOTE: No Firebase Storage upload. Publish via GitHub cloud-assets/ instead.


if __name__ == "__main__":
    main()
