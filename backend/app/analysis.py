"""Core analysis: user vector, country/demographic matches, PCA, blind spots."""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from app.assets import (
    get_country_sample_sizes,
    get_country_vectors,
    get_demographic_vectors,
    get_feature_columns,
    get_pca,
    get_scaler,
)

CHOICE_SCORE = {"A": 1.0, "B": 0.0}
TOP_COUNTRIES = 5
TOP_DEMOGRAPHICS = 5
SCATTER_DEMOGRAPHICS = 10
# Countries below this response count are too noisy to rank (e.g. IOT: 3).
MIN_COUNTRY_OUTCOMES = 100

# Feature pairs grouped for the 6-axis radar chart.
RADAR_GROUPS = {
    "Age": ["Age_Old", "Age_Young"],
    "Fitness": ["Fitness_Fat", "Fitness_Fit"],
    "Gender": ["Gender_Female", "Gender_Male"],
    "Social Status": ["Social Status_High", "Social Status_Low"],
    "Species": ["Species_Hoomans", "Species_Pets"],
    "Utilitarian": ["Utilitarian_Less", "Utilitarian_More"],
}


def build_user_vector(
    answers: list[dict], feature_columns: list[str], country_means: pd.Series
) -> tuple[pd.Series, list[str]]:
    """Map A/B answers to a 12-dim save-rate vector.

    Choice A (save) scores 1, choice B scores 0. Answered dimensions take the
    mean of their answers; unanswered dimensions fall back to the global
    country column mean, mirroring the pipeline fill strategy.
    """
    scores: dict[str, list[float]] = {}
    for answer in answers:
        dimension = answer["dimension"]
        if dimension not in feature_columns:
            continue
        scores.setdefault(dimension, []).append(CHOICE_SCORE[answer["choice"]])
    values = {
        dim: (float(np.mean(scores[dim])) if dim in scores else country_means[dim])
        for dim in feature_columns
    }
    return pd.Series(values, index=feature_columns), sorted(scores)


def _to_percent(cosine_value: float) -> int:
    """Map cosine similarity [-1, 1] to a 0-100 match percentage."""
    return round((max(-1.0, min(1.0, cosine_value)) + 1.0) / 2.0 * 100.0)


def eligible_countries(
    countries: list[str], sample_sizes: dict[str, int]
) -> list[str]:
    """Keep only countries with enough responses to be reliable.

    Micro-territories with a handful of responses have extreme, noisy
    vectors that spuriously win nearest-neighbor matches.
    """
    eligible = [c for c in countries if sample_sizes.get(c, 0) >= MIN_COUNTRY_OUTCOMES]
    return eligible if len(eligible) >= TOP_COUNTRIES else countries


def _answered_idx(answered: list[str], feature_columns: list[str]) -> list[int]:
    """Column indices the user actually answered. Falls back to all dims."""
    idx = [feature_columns.index(d) for d in answered if d in feature_columns]
    return idx if idx else list(range(len(feature_columns)))


def _masked_cosine(
    user_scaled: np.ndarray, matrix_scaled: np.ndarray, idx: list[int]
) -> np.ndarray:
    """Cosine similarity restricted to the answered subspace.

    Unanswered dimensions are mean-filled for display, but they must not
    vote: every candidate shares the same imputed values there, so including
    them only dilutes the real signal.
    """
    return cosine_similarity(
        user_scaled.reshape(1, -1)[:, idx], matrix_scaled[:, idx]
    )[0]


def rank_countries(
    user_scaled: np.ndarray,
    country_scaled: np.ndarray,
    countries: list[str],
    answered: list[str],
    feature_columns: list[str],
) -> list[dict]:
    """Rank countries by nearest neighbors in cosine space (k=5).

    Distance is measured on answered dimensions only; the similarity score
    shown to users comes from the same subspace.
    """
    idx = _answered_idx(answered, feature_columns)
    sims = _masked_cosine(user_scaled, country_scaled, idx)
    order = np.argsort(sims)[::-1][: min(TOP_COUNTRIES, len(countries))]
    return [
        {"country": countries[i], "similarity_pct": _to_percent(float(sims[i]))}
        for i in order
    ]


def rank_demographics(
    user_scaled: np.ndarray,
    demo_scaled: np.ndarray,
    demo_keys: list[str],
    answered: list[str],
    feature_columns: list[str],
) -> list[dict]:
    """Rank demographic groups by cosine similarity on answered dims only."""
    idx = _answered_idx(answered, feature_columns)
    sims = _masked_cosine(user_scaled, demo_scaled, idx)
    order = np.argsort(sims)[::-1][: min(TOP_DEMOGRAPHICS, len(demo_keys))]
    return [
        {"group": demo_keys[i], "similarity_pct": _to_percent(float(sims[i]))}
        for i in order
    ]


def build_radar(
    user_raw: pd.Series, match_raw: pd.Series
) -> list[dict]:
    """Build 6-axis radar points (user vs top-1 match, raw 0-1 scale)."""
    points = []
    for subject, features in RADAR_GROUPS.items():
        available = [f for f in features if f in user_raw.index]
        if not available:
            continue
        points.append(
            {
                "subject": subject,
                "user": round(float(user_raw[available].mean()), 3),
                "match": round(float(match_raw[available].mean()), 3),
            }
        )
    return points


def detect_blind_spots(
    user_raw: pd.Series,
    match_raw: pd.Series,
    country_means: pd.Series,
    answered: list[str],
) -> list[dict]:
    """Find answered dimensions where the user differs most from their twin.

    Each spot carries save-rate percentages for you, your top match, and the
    global average so the frontend can render a side-by-side comparison.
    """
    candidates = [dim for dim in answered if dim in user_raw.index]
    gaps = sorted(
        candidates,
        key=lambda d: abs(float(user_raw[d] - match_raw[d])),
        reverse=True,
    )[:3]
    spots = []
    for dim in gaps:
        user_pct = round(float(user_raw[dim]) * 100)
        match_pct = round(float(match_raw[dim]) * 100)
        global_pct = round(float(country_means[dim]) * 100)
        spots.append(
            {
                "dimension": dim,
                "user_pct": user_pct,
                "match_pct": match_pct,
                "global_pct": global_pct,
                # Legacy note kept for backward compatibility.
                "note": (
                    f"You {user_pct}% vs match {match_pct}% "
                    f"(global {global_pct}%)."
                ),
            }
        )
    return spots


def analyze(answers: list[dict]) -> dict:
    """Run the full analysis pipeline and return the API response payload."""
    feature_columns = get_feature_columns()
    country_vectors = get_country_vectors()
    demographic_vectors = get_demographic_vectors()
    scaler = get_scaler()
    pca = get_pca()

    country_means = country_vectors.mean()
    user_raw, answered = build_user_vector(answers, feature_columns, country_means)

    country_scaled = scaler.transform(country_vectors[feature_columns])
    demo_scaled = scaler.transform(demographic_vectors[feature_columns])
    user_scaled = scaler.transform(user_raw[feature_columns].to_frame().T)[0]

    countries = list(country_vectors.index)
    demo_keys = list(demographic_vectors.index)
    pool = eligible_countries(countries, get_country_sample_sizes())
    pool_idx = [countries.index(c) for c in pool]
    top_countries = rank_countries(
        user_scaled, country_scaled[pool_idx], pool, answered, feature_columns
    )
    top_demographics = rank_demographics(
        user_scaled, demo_scaled, demo_keys, answered, feature_columns
    )

    user_pc = [round(float(v), 4) for v in pca.transform(user_scaled.reshape(1, -1))[0]]
    country_pc = pca.transform(country_scaled)
    demo_pc = pca.transform(demo_scaled)

    match_country = top_countries[0]["country"]
    match_raw = country_vectors.loc[match_country]
    radar = build_radar(user_raw, match_raw)

    scatter_pc12 = [
        {"x": round(float(c[0]), 4), "y": round(float(c[1]), 4), "name": code, "kind": "country"}
        for code, c in zip(countries, country_pc)
    ]
    scatter_pc13 = [
        {"x": round(float(c[0]), 4), "y": round(float(c[2]), 4), "name": code, "kind": "country"}
        for code, c in zip(countries, country_pc)
    ]
    top_demo_order = [entry["group"] for entry in top_demographics[:SCATTER_DEMOGRAPHICS]]
    # Include top demographics in both scatter plots.
    for key in top_demo_order:
        i = demo_keys.index(key)
        scatter_pc12.append(
            {"x": round(float(demo_pc[i][0]), 4), "y": round(float(demo_pc[i][1]), 4), "name": key, "kind": "demo"}
        )
        scatter_pc13.append(
            {"x": round(float(demo_pc[i][0]), 4), "y": round(float(demo_pc[i][2]), 4), "name": key, "kind": "demo"}
        )
    scatter_pc12.append({"x": user_pc[0], "y": user_pc[1], "name": "You", "kind": "user"})
    scatter_pc13.append({"x": user_pc[0], "y": user_pc[2], "name": "You", "kind": "user"})

    return {
        "top_countries": top_countries,
        "top_demographics": top_demographics,
        "blind_spots": detect_blind_spots(user_raw, match_raw, country_means, answered),
        "radar": radar,
        "scatter_pc12": scatter_pc12,
        "scatter_pc13": scatter_pc13,
        "user_pc": user_pc,
        "match_name": match_country,
        "match_pool_size": len(pool),
        "n_answers": len(answers),
    }
