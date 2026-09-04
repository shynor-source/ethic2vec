"""Build country and demographic vectors, scaler, PCA, and feature list.

Offline pipeline, run once:
    uv run python data_pipeline/build_vectors.py

Outputs (backend/data_pipeline/output/):
    country_vectors.parquet      raw (unscaled) country x feature matrix for KNN and display
    demographic_vectors.parquet  raw (unscaled) demo_key x feature matrix
    scaler.pkl                   StandardScaler fitted on country vectors
    pca.pkl                      PCA(n_components=3) fitted on scaled country vectors
    feature_columns.json         ordered feature column names
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DATASET_DIR = BACKEND_ROOT.parent / "dataset"
OUTPUT_DIR = BACKEND_ROOT / "data_pipeline" / "output"

COUNTRY_CSV = DATASET_DIR / "country_preferences.csv"
DEMOGRAPHIC_CSV = DATASET_DIR / "demographic_preferences.csv"


def load_country_matrix() -> pd.DataFrame:
    """Pivot country preferences to a country x dimension matrix."""
    df = pd.read_csv(COUNTRY_CSV)
    df["dimension"] = df["scenario_type"] + "_" + df["character_group"]
    matrix = df.pivot_table(index="country", columns="dimension", values="save_rate")
    # Fill missing values with the global column mean, never with zero.
    matrix = matrix.fillna(matrix.mean())
    return matrix


def load_demographic_matrix() -> pd.DataFrame:
    """Pivot demographic preferences to a demo_key x dimension matrix."""
    df = pd.read_csv(DEMOGRAPHIC_CSV)
    df["column"] = df["scenario_type"] + "_" + df["character_group"]
    df["demo_key"] = df["dimension"] + "_" + df["group"]
    matrix = df.pivot_table(index="demo_key", columns="column", values="save_rate")
    matrix = matrix.fillna(matrix.mean())
    return matrix


def align_columns(
    country_vectors: pd.DataFrame, demographic_vectors: pd.DataFrame
) -> tuple[pd.DataFrame, pd.DataFrame, list[str]]:
    """Align both matrices to the union of columns in sorted order."""
    feature_columns = sorted(
        set(country_vectors.columns) | set(demographic_vectors.columns)
    )
    country_vectors = country_vectors.reindex(columns=feature_columns)
    demographic_vectors = demographic_vectors.reindex(columns=feature_columns)
    # Fill columns missing from one table with that table's own column mean.
    country_vectors = country_vectors.fillna(country_vectors.mean())
    demographic_vectors = demographic_vectors.fillna(demographic_vectors.mean())
    return country_vectors, demographic_vectors, feature_columns


def print_pca_summary(pca: PCA, feature_columns: list[str]) -> None:
    """Print explained variance and top loadings for manual axis naming."""
    print(f"explained_variance_ratio_: {pca.explained_variance_ratio_.tolist()}")
    for i, component in enumerate(pca.components_):
        loadings = pd.Series(component, index=feature_columns)
        top_positive = loadings.nlargest(3)
        top_negative = loadings.nsmallest(3)
        print(f"PC{i + 1} top positive: {top_positive.to_dict()}")
        print(f"PC{i + 1} top negative: {top_negative.to_dict()}")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    country_vectors = load_country_matrix()
    demographic_vectors = load_demographic_matrix()
    country_vectors, demographic_vectors, feature_columns = align_columns(
        country_vectors, demographic_vectors
    )
    print(f"country shape: {country_vectors.shape}")
    print(f"demographic shape: {demographic_vectors.shape}")
    print(f"features ({len(feature_columns)}): {feature_columns}")

    scaler = StandardScaler()
    country_scaled = scaler.fit_transform(country_vectors)
    demographic_scaled = scaler.transform(demographic_vectors)

    pca = PCA(n_components=3, random_state=42)
    pca.fit(country_scaled)
    print_pca_summary(pca, feature_columns)

    # Persist raw (unscaled) matrices; scaling is reapplied at runtime.
    country_vectors.to_parquet(OUTPUT_DIR / "country_vectors.parquet")
    demographic_vectors.to_parquet(OUTPUT_DIR / "demographic_vectors.parquet")
    joblib.dump(scaler, OUTPUT_DIR / "scaler.pkl")
    joblib.dump(pca, OUTPUT_DIR / "pca.pkl")
    (OUTPUT_DIR / "feature_columns.json").write_text(
        json.dumps(feature_columns, indent=2), encoding="utf-8"
    )
    print(f"Saved 5 files to {OUTPUT_DIR}")
    _ = demographic_scaled  # fitted for validation; persisted matrices stay unscaled.


if __name__ == "__main__":
    main()
