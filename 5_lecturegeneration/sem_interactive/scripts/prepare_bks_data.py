# ABOUTME: Extracts BKS dataset columns relevant to SEM teaching and pre-computes
# ABOUTME: correlation matrices, descriptive stats, and SEM model results as JSON.

import json
from pathlib import Path

import click
import numpy as np
import pandas as pd
import semopy


# Columns suitable for a teaching SEM model:
# OCEAN personality as 5 observed indicators of a "Personality" construct,
# plus powerlessness and age as predictors/outcomes.
SEM_COLUMNS = [
    "opennessvariable",
    "consciensiousnessvariable",
    "extroversionvariable",
    "neuroticismvariable",
    "agreeablenessvariable",
    "powerlessnessvariable",
    "totalfetishcategory",
]

VARIABLE_DESCRIPTIONS = {
    "opennessvariable": "Openness to Experience (OCEAN personality, avg score -6 to 6)",
    "consciensiousnessvariable": "Conscientiousness (OCEAN personality, avg score -6 to 6)",
    "extroversionvariable": "Extroversion (OCEAN personality, avg score -6 to 6)",
    "neuroticismvariable": "Neuroticism (OCEAN personality, avg score -6 to 6)",
    "agreeablenessvariable": "Agreeableness (OCEAN personality, avg score -6 to 6)",
    "powerlessnessvariable": "Powerlessness (computed score, -9 to 9)",
    "totalfetishcategory": "Total fetish category count (number of fetish categories endorsed)",
}

# SEM model specification in lavaan-style syntax (used by semopy)
# A simple model: Personality latent predicted by OCEAN indicators,
# with structural path from Personality to Powerlessness
SEM_MODEL_SPEC = """
Personality =~ opennessvariable + consciensiousnessvariable + extroversionvariable + agreeablenessvariable
Personality ~ neuroticismvariable
powerlessnessvariable ~ Personality + neuroticismvariable + totalfetishcategory
"""


def load_bks_data(parquet_path: Path) -> pd.DataFrame:
    """Load the BKS public parquet file."""
    return pd.read_parquet(parquet_path)


def select_sem_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Select and clean columns relevant to the SEM teaching model."""
    selected = df[SEM_COLUMNS].copy()
    selected = selected.dropna()
    return selected


def compute_descriptive_stats(df: pd.DataFrame) -> dict:
    """Compute descriptive statistics and correlation matrix."""
    numeric_df = df.select_dtypes(include="number")
    return {
        "means": numeric_df.mean().round(3).to_dict(),
        "std_devs": numeric_df.std().round(3).to_dict(),
        "correlation_matrix": numeric_df.corr().round(3).to_dict(),
        "n": len(df),
        "columns": list(numeric_df.columns),
    }


def fit_sem_model(df: pd.DataFrame) -> dict:
    """Fit the SEM model using semopy and return results."""
    model = semopy.Model(SEM_MODEL_SPEC)
    model.fit(df)

    # Extract fit indices
    stats = semopy.calc_stats(model)
    fit_indices = {}
    for col in stats.columns:
        val = stats[col].iloc[0]
        key = col.lower().replace(" ", "_")
        fit_indices[key] = round(float(val), 4) if pd.notna(val) else None

    # Rename to standard names if needed
    fit_renames = {"chi2": "chi_square"}
    for old, new in fit_renames.items():
        if old in fit_indices:
            fit_indices[new] = fit_indices.pop(old)

    # Extract parameter estimates
    estimates = model.inspect()
    path_coefficients = []
    factor_loadings = []

    def safe_float(val):
        """Convert a value to float, returning None for non-numeric values like '-'."""
        if val is None or (isinstance(val, str) and val.strip() == "-"):
            return None
        try:
            f = float(val)
            return round(f, 4) if pd.notna(f) else None
        except (ValueError, TypeError):
            return None

    for _, row in estimates.iterrows():
        entry = {
            "from": row["lval"],
            "op": row["op"],
            "to": row["rval"],
            "estimate": safe_float(row["Estimate"]),
        }
        # Add standard error if available
        if "Std. Err" in row.index:
            val = safe_float(row.get("Std. Err"))
            if val is not None:
                entry["std_err"] = val
        # Add p-value if available
        if "p-value" in row.index:
            val = safe_float(row.get("p-value"))
            if val is not None:
                entry["p_value"] = val

        if row["op"] == "~":
            path_coefficients.append(entry)
        elif row["op"] == "=~":
            factor_loadings.append(entry)

    return {
        "model_spec": SEM_MODEL_SPEC.strip(),
        "path_coefficients": path_coefficients,
        "factor_loadings": factor_loadings,
        "fit_indices": fit_indices,
    }


def export_json(stats: dict, sem_results: dict, output_path: Path) -> None:
    """Export combined results to JSON."""
    output = {
        "variable_descriptions": VARIABLE_DESCRIPTIONS,
        "descriptive_stats": stats,
        "sem_results": sem_results,
    }
    output_path.write_text(json.dumps(output, indent=2))


@click.command()
@click.option(
    "--parquet",
    type=click.Path(exists=True, path_type=Path),
    required=True,
    help="Path to BKSPublic.parquet",
)
@click.option(
    "--output",
    type=click.Path(path_type=Path),
    default=Path(__file__).parent.parent / "data" / "bks_excerpt.json",
    help="Output JSON path",
)
def main(parquet: Path, output: Path):
    """Prepare BKS data for the interactive SEM web page."""
    click.echo(f"Loading data from {parquet}...")
    df = load_bks_data(parquet)
    click.echo(f"Loaded {len(df)} rows, {len(df.columns)} columns")

    click.echo("Selecting SEM columns...")
    selected = select_sem_columns(df)
    click.echo(f"Selected {len(selected.columns)} columns, {len(selected)} complete cases")

    click.echo("Computing descriptive statistics...")
    stats = compute_descriptive_stats(selected)

    click.echo("Fitting SEM model...")
    sem_results = fit_sem_model(selected)
    click.echo(f"Model fit: CFI={sem_results['fit_indices'].get('cfi', 'N/A')}")

    click.echo(f"Exporting to {output}...")
    output.parent.mkdir(parents=True, exist_ok=True)
    export_json(stats, sem_results, output)
    click.echo("Done!")


if __name__ == "__main__":
    main()
