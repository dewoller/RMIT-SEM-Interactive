# ABOUTME: Tests for the BKS data preparation script that exports SEM-ready JSON.
# ABOUTME: Validates column selection, covariance computation, and SEM model fitting.

import json
import pytest
from pathlib import Path

from prepare_bks_data import (
    load_bks_data,
    select_sem_columns,
    compute_descriptive_stats,
    fit_sem_model,
    export_json,
)

PARQUET_PATH = Path(__file__).parent.parent.parent.parent / "05_survey_dataset" / "BKSPublic.parquet"


def test_load_bks_data():
    df = load_bks_data(PARQUET_PATH)
    assert len(df) > 15000
    assert "opennessvariable" in df.columns


def test_select_sem_columns():
    df = load_bks_data(PARQUET_PATH)
    selected = select_sem_columns(df)
    assert "opennessvariable" in selected.columns
    assert "neuroticismvariable" in selected.columns
    assert "agreeablenessvariable" in selected.columns
    assert "extroversionvariable" in selected.columns
    assert "consciensiousnessvariable" in selected.columns
    assert len(selected.columns) < 20


def test_compute_descriptive_stats():
    df = load_bks_data(PARQUET_PATH)
    selected = select_sem_columns(df)
    stats = compute_descriptive_stats(selected)
    assert "means" in stats
    assert "std_devs" in stats
    assert "correlation_matrix" in stats
    assert "n" in stats
    assert stats["n"] > 0


def test_fit_sem_model():
    df = load_bks_data(PARQUET_PATH)
    selected = select_sem_columns(df)
    results = fit_sem_model(selected)
    assert "path_coefficients" in results
    assert "fit_indices" in results
    assert "factor_loadings" in results
    fit = results["fit_indices"]
    assert "chi_square" in fit or "chi2" in fit


def test_export_json(tmp_path):
    df = load_bks_data(PARQUET_PATH)
    selected = select_sem_columns(df)
    stats = compute_descriptive_stats(selected)
    sem_results = fit_sem_model(selected)
    output_path = tmp_path / "test_output.json"
    export_json(stats, sem_results, output_path)
    assert output_path.exists()
    data = json.loads(output_path.read_text())
    assert "descriptive_stats" in data
    assert "sem_results" in data
    assert "variable_descriptions" in data
