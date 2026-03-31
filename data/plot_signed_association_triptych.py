from __future__ import annotations

import math
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns


MERGED_CSV = Path(
    "/Users/primav/Documents/GitHub/dual-paradigm/data/paper_dimension_analysis_dataset.csv"
)
L1_CSV = Path(
    "/Users/primav/Documents/GitHub/dual-paradigm/data/paper_il_l1_logistic_coefficients.csv"
)
OUTPUT = Path(
    "/Users/primav/Documents/GitHub/dual-paradigm/data/paper_signed_association_triptych.png"
)

OUTCOMES = ["I_design", "J_presentation", "K_representation", "L_data"]


def clean_feature_name(name: str) -> str:
    s = name.replace("__union", "")
    s = s.replace("\n", " ")
    s = s.replace("data origin (when) historical, live, predictive, synthesized", "Data Origin")
    s = s.replace("representation form (how)", "Representation")
    s = s.replace("Presentation (how)", "Presentation")
    s = s.replace("Goal (why)", "Goal")
    s = s.replace("Topic (what)", "Topic")
    s = s.replace("User (who)", "User")
    return s


def signed_phi(a: int, b: int, c: int, d: int) -> float:
    denom = math.sqrt((a + b) * (c + d) * (a + c) * (b + d))
    if denom == 0:
        return 0.0
    return ((a * d) - (b * c)) / denom


def signed_log_odds_ratio(a: int, b: int, c: int, d: int) -> float:
    # Haldane-Anscombe correction for zero counts.
    a += 0.5
    b += 0.5
    c += 0.5
    d += 0.5
    return math.log((a * d) / (b * c))


def build_signed_bivariate() -> tuple[pd.DataFrame, pd.DataFrame]:
    df = pd.read_csv(MERGED_CSV)
    df = df[df["matched_overall"] == 1].copy()
    feature_cols = [c for c in df.columns if c.endswith("__union")]

    phi_rows = []
    lor_rows = []
    for feature in feature_cols:
        for outcome in OUTCOMES:
            feature_vals = df[feature].fillna(0).astype(int)
            outcome_vals = df[outcome].fillna(0).astype(int)

            a = int(((feature_vals == 1) & (outcome_vals == 1)).sum())
            b = int(((feature_vals == 1) & (outcome_vals == 0)).sum())
            c = int(((feature_vals == 0) & (outcome_vals == 1)).sum())
            d = int(((feature_vals == 0) & (outcome_vals == 0)).sum())

            phi_rows.append(
                {
                    "feature": feature,
                    "outcome": outcome,
                    "value": signed_phi(a, b, c, d),
                }
            )
            lor_rows.append(
                {
                    "feature": feature,
                    "outcome": outcome,
                    "value": signed_log_odds_ratio(a, b, c, d),
                }
            )

    phi_df = pd.DataFrame(phi_rows)
    lor_df = pd.DataFrame(lor_rows)
    return phi_df, lor_df


def build_coef_df() -> pd.DataFrame:
    coef_df = pd.read_csv(L1_CSV)
    coef_df = coef_df[coef_df["feature"].str.startswith("bin__", na=False)].copy()
    coef_df["feature"] = coef_df["feature"].str.replace("bin__", "", regex=False)
    return coef_df[["feature", "outcome", "coefficient"]].rename(columns={"coefficient": "value"})


def choose_features(phi_df: pd.DataFrame, coef_df: pd.DataFrame, limit: int = 16) -> list[str]:
    phi_rank = (
        phi_df.assign(abs_value=lambda d: d["value"].abs())
        .groupby("feature", as_index=False)["abs_value"]
        .max()
        .sort_values("abs_value", ascending=False)
    )
    coef_rank = (
        coef_df.assign(abs_value=lambda d: d["value"].abs())
        .groupby("feature", as_index=False)["abs_value"]
        .max()
        .sort_values("abs_value", ascending=False)
    )

    ordered = []
    for feature in list(phi_rank["feature"]) + list(coef_rank["feature"]):
        if feature not in ordered:
            ordered.append(feature)
        if len(ordered) >= limit:
            break
    return ordered


def to_matrix(df: pd.DataFrame, features: list[str], value_col: str = "value") -> pd.DataFrame:
    pivot = (
        df.pivot(index="feature", columns="outcome", values=value_col)
        .reindex(features)
        .reindex(columns=OUTCOMES)
        .fillna(0)
    )
    pivot.index = [clean_feature_name(idx) for idx in pivot.index]
    return pivot


def plot_triptych():
    phi_df, lor_df = build_signed_bivariate()
    coef_df = build_coef_df()
    features = choose_features(phi_df, coef_df, limit=16)

    lor_mat = to_matrix(lor_df, features)
    coef_mat = to_matrix(coef_df, features)
    phi_mat = to_matrix(phi_df, features)

    plt.rcParams["font.family"] = "DejaVu Sans"
    sns.set_style("white")
    fig, axes = plt.subplots(
        1, 3, figsize=(18, max(7.5, 0.38 * len(features) + 2.5)), sharey=True
    )

    common = dict(
        cmap="coolwarm",
        center=0,
        linewidths=0.5,
        linecolor="white",
        annot=True,
        fmt=".2f",
        annot_kws={"fontsize": 9},
    )

    sns.heatmap(
        lor_mat,
        ax=axes[0],
        vmin=-3,
        vmax=3,
        cbar_kws={"label": "log(odds ratio)"},
        **common,
    )
    axes[0].set_title("Signed Odds Ratio", fontsize=16, fontweight="bold", pad=12)
    axes[0].set_xlabel("")
    axes[0].set_ylabel("")

    coef_lim = max(0.5, float(np.nanmax(np.abs(coef_mat.to_numpy()))))
    sns.heatmap(
        coef_mat,
        ax=axes[1],
        vmin=-coef_lim,
        vmax=coef_lim,
        cbar_kws={"label": "L1 coefficient"},
        **common,
    )
    axes[1].set_title("Signed Coefficient", fontsize=16, fontweight="bold", pad=12)
    axes[1].set_xlabel("")
    axes[1].set_ylabel("")

    sns.heatmap(
        phi_mat,
        ax=axes[2],
        vmin=-0.45,
        vmax=0.45,
        cbar_kws={"label": "signed phi"},
        **common,
    )
    axes[2].set_title("Signed Phi Heatmap", fontsize=16, fontweight="bold", pad=12)
    axes[2].set_xlabel("")
    axes[2].set_ylabel("")

    for ax in axes:
        ax.tick_params(axis="x", rotation=25, labelsize=10)
        ax.tick_params(axis="y", labelsize=10)

    fig.suptitle(
        "Joint associations between overall labels and paper I-L outcomes",
        fontsize=18,
        fontweight="bold",
        y=0.995,
    )
    fig.tight_layout()
    fig.savefig(OUTPUT, dpi=220, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"output={OUTPUT}")


if __name__ == "__main__":
    plot_triptych()
