# Interactive SEM Educational Web Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static interactive web page teaching SEM to psychology students, deployed on GitHub Pages, using BKS dataset excerpts for real-world examples.

**Architecture:** Single long-scrolling HTML page with vanilla JS for interactivity. D3.js v7 (CDN) handles all SVG diagrams and simulations. A Python script pre-computes SEM results from BKS data and exports JSON consumed by the browser. No build tools.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, D3.js v7, Python (pandas, semopy, pyarrow), uv for Python deps, pytest for Python tests.

**Source content:** `SEM_Presentation_Content.md` in the same directory.

**BKS data location:** `../05_survey_dataset/BKSPublic.parquet` (15,511 rows x 376 columns)

**Design doc:** `docs/plans/2026-02-27-sem-interactive-web-design.md`

---

## Task 1: Project Scaffolding

Create the directory structure and base files with minimal content to verify the skeleton works in a browser.

**Files:**
- Create: `sem_interactive/index.html`
- Create: `sem_interactive/css/style.css`
- Create: `sem_interactive/js/navigation.js`
- Create: `sem_interactive/js/quiz.js`
- Create: `sem_interactive/js/diagrams.js`
- Create: `sem_interactive/js/simulations.js`

**Step 1: Create directory structure**

```bash
cd 5_lecturegeneration
mkdir -p sem_interactive/{css,js,data,assets,scripts}
```

**Step 2: Create base index.html**

Create `sem_interactive/index.html` with:
- DOCTYPE, html lang="en", head with meta charset, viewport, title
- Google Fonts link for `Source Serif 4`
- Link to `css/style.css`
- D3.js v7 CDN script tag: `https://d3js.org/d3.v7.min.js`
- Script tags for all four JS files (defer)
- Body with:
  - `<nav id="main-nav">` with placeholder section links
  - `<div id="progress-bar">` for scroll progress
  - `<main id="content">` with 10 empty `<section>` elements, each with an id matching section names (e.g., `section-welcome`, `section-data-types`, etc.) and an `<h2>` placeholder title
  - `<footer>` with attribution to Prof Leila Karimi
- ABOUTME comment at top of file

**Step 3: Create base style.css**

Create `sem_interactive/css/style.css` with:
- ABOUTME comment
- CSS custom properties (`:root`) for all design tokens:
  - `--bg: #fafaf8`, `--text: #2d2d2d`, `--accent: #2563eb`
  - `--success: #16a34a`, `--error: #dc2626`, `--muted: #6b7280`
  - `--font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - `--font-heading: 'Source Serif 4', Georgia, serif`
  - `--font-mono: 'SF Mono', 'Fira Code', monospace`
  - `--max-width: 720px`
- Reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
- Body: bg color, font-family body stack, font-size 18px, line-height 1.6, color text
- Headings: font-family heading stack
- `main`: max-width var, margin 0 auto, padding 0 2rem
- `section`: min-height 80vh, padding 4rem 0, border-bottom 1px solid #e5e5e5
- `nav#main-nav`: position fixed, top 0, width 100%, bg white, border-bottom, z-index 100, padding 0.5rem 1rem, display flex, gap 1rem, overflow-x auto
- `nav a`: text-decoration none, color muted, font-size 0.85rem, white-space nowrap
- `nav a.active`: color accent, font-weight 600
- `#progress-bar`: position fixed, top 0, left 0, height 3px, bg accent, z-index 200, transition width 0.1s
- `body`: padding-top 3rem (for fixed nav)
- Code/technical terms: `code, .term { font-family: var(--font-mono); font-size: 0.9em; background: #f3f3f0; padding: 0.1em 0.3em; border-radius: 3px; }`

**Step 4: Create placeholder JS files**

Each JS file gets an ABOUTME comment and a `DOMContentLoaded` listener that logs to console:

`navigation.js`: `console.log('navigation.js loaded');`
`quiz.js`: `console.log('quiz.js loaded');`
`diagrams.js`: `console.log('diagrams.js loaded');`
`simulations.js`: `console.log('simulations.js loaded');`

**Step 5: Open in browser to verify**

```bash
open sem_interactive/index.html
```

Verify: page loads, nav bar visible at top, 10 sections visible with titles, console shows all 4 JS files loaded, no errors in console.

**Step 6: Commit**

```bash
git add sem_interactive/
git commit -m "feat: scaffold SEM interactive site structure"
```

---

## Task 2: Navigation System

Implement scroll progress bar, active section highlighting, and smooth scroll navigation.

**Files:**
- Modify: `sem_interactive/js/navigation.js`
- Modify: `sem_interactive/css/style.css` (if needed for active states)

**Step 1: Implement progress bar**

In `navigation.js`, on `scroll` event (throttled with `requestAnimationFrame`):
- Calculate `scrollTop / (scrollHeight - clientHeight)` as percentage
- Set `#progress-bar` width to that percentage

**Step 2: Implement active section tracking**

Using `IntersectionObserver` with `threshold: 0.3`:
- Observe all `<section>` elements
- When a section enters viewport, add `.active` class to matching nav link
- Remove `.active` from all other nav links

**Step 3: Implement smooth scroll on nav click**

Add click handlers to all nav links:
- `e.preventDefault()`
- Get target section from `href` attribute
- `targetSection.scrollIntoView({ behavior: 'smooth' })`

**Step 4: Open and test in browser**

- Scroll the page: progress bar should fill from left to right
- Section nav links should highlight as sections come into view
- Clicking a nav link should smooth-scroll to that section

**Step 5: Commit**

```bash
git add sem_interactive/js/navigation.js sem_interactive/css/style.css
git commit -m "feat: add navigation with progress bar and active section tracking"
```

---

## Task 3: Static Content — Sections 1-2 (Welcome + Data Types)

Port the presentation content for the first two sections into semantic HTML with proper styling.

**Files:**
- Modify: `sem_interactive/index.html` (sections 1-2 content)
- Modify: `sem_interactive/css/style.css` (content styling)

**Step 1: Add educational content CSS classes**

Add to `style.css`:
- `.learning-callout`: blue-left-border box for "What you'll learn" callouts
- `.key-takeaway`: green-left-border box for "Key takeaway" summaries
- `.term-tooltip`: styled technical term with dotted underline, title attribute
- `.definition-card`: card with subtle border for definition blocks (data types)
- `.example-list`: styled example list within definition cards
- `.note`: small muted text for notes (e.g., "Can calculate mean")

**Step 2: Write Section 1 — Welcome and Learning Objectives**

In `index.html`, populate `#section-welcome` with:
- `<h2>` title
- `.learning-callout` box listing what students will learn
- Brief intro paragraph (2-3 sentences summarizing the page)
- Attribution to Prof Leila Karimi

**Step 3: Write Section 2 — Data Types Foundation**

In `index.html`, populate `#section-data-types` with:
- `.learning-callout` box
- Three `.definition-card` elements for Continuous, Categorical, Dichotomous data
- Each card has: definition, examples list, note about what operations are valid
- After the cards: a `<div class="quiz-container" id="quiz-data-types">` placeholder (quiz will be wired in Task 5)
- `.key-takeaway` summary box

**Step 4: Open and verify visual appearance**

Check: typography, spacing, card layouts, responsive behavior at different widths.

**Step 5: Commit**

```bash
git add sem_interactive/index.html sem_interactive/css/style.css
git commit -m "feat: add content for welcome and data types sections"
```

---

## Task 4: Static Content — Sections 3-5 (Variables, Tests, SEM Intro)

**Files:**
- Modify: `sem_interactive/index.html` (sections 3-5 content)
- Modify: `sem_interactive/css/style.css` (additional content styling as needed)

**Step 1: Write Section 3 — Understanding Variables**

Populate `#section-variables` with:
- `.learning-callout`
- Two `.definition-card` elements for IV and DV
- Each card: definition, alternative names, examples
- "Remember" callout: `IV → DV`
- A `<div class="diagram-container" id="diagram-variables">` placeholder for the interactive IV→DV diagram (Task 7)
- `.key-takeaway`

**Step 2: Write Section 4 — Parametric vs Non-Parametric Tests**

Populate `#section-tests` with:
- `.learning-callout`
- Side-by-side comparison layout (CSS grid, 2 columns) for parametric vs non-parametric
- Each side: definition, requirements/when-to-use, common tests list, power note
- A `<div class="diagram-container" id="diagram-decision-tree">` placeholder for interactive decision tree (Task 8)
- `.key-takeaway` with "Pro Tip: Always check your assumptions BEFORE choosing your test!"

**Step 3: Write Section 5 — Introduction to SEM**

Populate `#section-sem-intro` with:
- `.learning-callout`
- Definition paragraph
- History timeline: styled as a vertical timeline with CSS (dates on left, descriptions on right)
  - 1920s: Path analysis (Sewall Wright)
  - Mid-20th century: Factor analysis evolution
  - 1970s: Formal introduction as SEM
  - 1970: Peter Bentler and EQS
- Citation for Karimi & Meyer (2014)
- `.key-takeaway`

**Step 4: Add CSS for new patterns**

- `.comparison-grid`: CSS grid, 2 columns on desktop, 1 on tablet
- `.timeline`: vertical line with dated nodes
- `.timeline-item`: positioned relative to the vertical line

**Step 5: Open and verify**

Check all three new sections render correctly, comparison grid collapses on narrow screens, timeline reads well.

**Step 6: Commit**

```bash
git add sem_interactive/index.html sem_interactive/css/style.css
git commit -m "feat: add content for variables, tests, and SEM intro sections"
```

---

## Task 5: Quiz Engine

Build the reusable quiz component and wire it into the data types section.

**Files:**
- Modify: `sem_interactive/js/quiz.js`
- Modify: `sem_interactive/css/style.css` (quiz styles)
- Modify: `sem_interactive/index.html` (quiz data attributes)

**Step 1: Define quiz data structure**

In `quiz.js`, define quiz data as an array of objects:

```javascript
const quizData = {
  "data-types": [
    {
      question: "A patient's temperature (e.g., 37.2°C)",
      options: ["Continuous", "Categorical", "Dichotomous"],
      correct: 0,
      explanations: {
        0: "Correct! Temperature is measured on a continuous scale with meaningful intervals.",
        1: "Not quite. Temperature has meaningful numerical distances between values, making it continuous.",
        2: "Not quite. Temperature isn't limited to two categories — it's a continuous measurement."
      }
    },
    // ... 4 more questions from the presentation's Quick Check Exercise
  ],
  "latent-variables": [ /* Section 6 quiz */ ],
  "assumption-violations": [ /* Section 7 quiz */ ],
  "model-fit": [ /* Section 8 quiz */ ]
};
```

Include all quiz questions from the presentation content (data type identification, latent variable identification, assumption violation scenarios).

**Step 2: Build quiz renderer**

Function `renderQuiz(containerId, quizKey)`:
- Find container element by id
- For each question in `quizData[quizKey]`:
  - Create `.quiz-question` div with question text as `<p>`
  - Create `.quiz-options` div with button for each option
  - Each button has `data-index` attribute
  - Create `.quiz-feedback` div (hidden initially)
- Attach click handlers to option buttons

**Step 3: Implement answer checking**

On option button click:
- Disable all buttons for that question (prevent re-answer)
- If correct: add `.correct` class to button, show green feedback with explanation
- If wrong: add `.incorrect` class to clicked button, add `.correct` class to correct button, show red feedback with explanation
- Animate feedback div sliding in

**Step 4: Add quiz CSS**

```css
.quiz-container { margin: 2rem 0; padding: 1.5rem; border: 1px solid #e5e5e5; border-radius: 8px; }
.quiz-question { margin-bottom: 1rem; }
.quiz-question p { font-weight: 600; margin-bottom: 0.75rem; }
.quiz-options { display: flex; flex-direction: column; gap: 0.5rem; }
.quiz-options button { /* styled as cards, left-aligned text, hover state */ }
.quiz-options button.correct { border-color: var(--success); background: #f0fdf4; }
.quiz-options button.incorrect { border-color: var(--error); background: #fef2f2; }
.quiz-options button:disabled { opacity: 0.7; cursor: default; }
.quiz-feedback { margin-top: 0.75rem; padding: 0.75rem; border-radius: 6px; }
.quiz-feedback.correct { background: #f0fdf4; border-left: 3px solid var(--success); }
.quiz-feedback.incorrect { background: #fef2f2; border-left: 3px solid var(--error); }
```

**Step 5: Wire data types quiz into HTML**

In `index.html`, update `#quiz-data-types` div with `data-quiz="data-types"` attribute.

In `quiz.js`, on `DOMContentLoaded`, find all `.quiz-container[data-quiz]` elements and call `renderQuiz()` for each.

**Step 6: Test in browser**

- Data types quiz should render with 5 questions
- Click correct answer → green highlight, explanation shown
- Click wrong answer → red highlight on clicked, green on correct, explanation shown
- Cannot re-answer after clicking
- Keyboard accessible (Tab to buttons, Enter to select)

**Step 7: Commit**

```bash
git add sem_interactive/js/quiz.js sem_interactive/css/style.css sem_interactive/index.html
git commit -m "feat: add quiz engine with data types quiz"
```

---

## Task 6: Static Content — Sections 6-10 (SEM Core + Case Study)

Complete all remaining static content sections.

**Files:**
- Modify: `sem_interactive/index.html` (sections 6-10)
- Modify: `sem_interactive/css/style.css` (additional styles)

**Step 1: Write Section 6 — Key Concepts and Latent Variables**

Populate `#section-key-concepts` with:
- `.learning-callout`
- Core terminology list (styled as definition list `<dl>`)
- "What Is a Latent Variable?" explanation with burnout example
- `<div class="diagram-container" id="diagram-sem-model">` placeholder for visual model (Task 8)
- `<div class="quiz-container" data-quiz="latent-variables">` for quiz
- `.key-takeaway`

**Step 2: Write Section 7 — SEM Analysis Process**

Populate `#section-sem-process` with:
- `.learning-callout`
- Steps list styled as a numbered process flow (CSS styled ordered list with connecting lines)
- Assumptions list with brief explanations
- `<div class="quiz-container" data-quiz="assumption-violations">` with activity scenarios from presentation
- `.key-takeaway`

Add CSS: `.process-steps` — styled `<ol>` with large numbers, connecting vertical line

**Step 3: Write Section 8 — Model Fit and Indices**

Populate `#section-fit-indices` with:
- `.learning-callout`
- Fit indices table: Chi-square, CFI, RMSEA, SRMR — each with description and threshold
- Pro Tip callout about multiple fit indices
- `<div class="simulation-container" id="sim-fit-explorer">` placeholder for simulation (Task 9)
- `<div class="quiz-container" data-quiz="model-fit">` for comparison exercise
- `.key-takeaway`

**Step 4: Write Section 9 — Software and Tools**

Populate `#section-software` with:
- `.learning-callout`
- Software comparison cards (AMOS, LISREL, Mplus, R lavaan, Python semopy) with brief pros
- `.key-takeaway`

**Step 5: Write Section 10 — Case Study**

Populate `#section-case-study` with:
- `.learning-callout`
- Case study narrative: stress, anxiety, coping, academic performance in university students
- Model components listed with arrows
- `<div class="simulation-container" id="sim-bks-model">` placeholder for BKS simulation (Task 10)
- Evaluation criteria reminder
- `.key-takeaway`

**Step 6: Add remaining quiz data**

In `quiz.js`, populate the `latent-variables`, `assumption-violations`, and `model-fit` quiz data arrays with questions from the presentation.

**Step 7: Add glossary sidebar**

Add a collapsible `<aside id="glossary">` at the end of `<body>`:
- Toggle button fixed to right edge of screen
- Alphabetical list of all technical terms used in the page
- Each term with a plain-English definition
- CSS: slides in from right, `position: fixed`, `overflow-y: auto`

**Step 8: Open and verify all sections**

All 10 sections should have content. All 4 quizzes should work. Glossary should toggle open/close.

**Step 9: Commit**

```bash
git add sem_interactive/
git commit -m "feat: complete all content sections with quizzes and glossary"
```

---

## Task 7: Interactive Diagram — Variable Relationships (Section 3)

Build the IV→DV diagram with add-mediator/moderator buttons using D3.js.

**Files:**
- Modify: `sem_interactive/js/diagrams.js`
- Modify: `sem_interactive/css/style.css` (diagram styles)

**Step 1: Create the base IV→DV SVG diagram**

In `diagrams.js`, function `initVariableDiagram()`:
- Select `#diagram-variables`, append `<svg>` with viewBox for responsive sizing
- Draw two rounded rectangles: "Therapy Type (IV)" on left, "Depression Score (DV)" on right
- Draw an arrow path between them with arrowhead marker
- Add text labels inside rectangles
- Hover on a rectangle: show a tooltip with the definition (from presentation content)

**Step 2: Add "Add Mediator" button**

Below the SVG, render a button "Add Mediator Variable".
On click:
- Animate a third oval ("Coping Strategy") appearing between IV and DV
- Reroute paths: IV→Mediator→DV (two arrows replacing the single one)
- Add brief text explanation below: "A mediator explains HOW the IV affects the DV"
- Disable the button after clicking (one-time action)

**Step 3: Add "Add Moderator" button**

Render a button "Add Moderator Variable".
On click:
- Animate a fourth oval ("Social Support") appearing above the IV→DV path
- Draw a dashed arrow from moderator to the path (interaction effect)
- Add explanation: "A moderator changes the STRENGTH or DIRECTION of the IV→DV relationship"
- Disable button after clicking

**Step 4: Add diagram CSS**

```css
.diagram-container { margin: 2rem 0; text-align: center; }
.diagram-container svg { max-width: 100%; height: auto; }
.diagram-container .controls { margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center; }
.diagram-container button { /* styled consistently with quiz buttons */ }
.diagram-tooltip { /* positioned tooltip */ }
```

**Step 5: Initialize on scroll-into-view**

Use `IntersectionObserver` in `diagrams.js` to call `initVariableDiagram()` only when `#diagram-variables` enters viewport (lazy loading).

**Step 6: Test in browser**

- Diagram shows IV→DV on load
- Hover shows tooltips
- "Add Mediator" animates the mediator into place
- "Add Moderator" animates the moderator
- Both buttons disable after use
- SVG scales with window width

**Step 7: Commit**

```bash
git add sem_interactive/js/diagrams.js sem_interactive/css/style.css
git commit -m "feat: add interactive variable relationship diagram with mediator/moderator"
```

---

## Task 8: Interactive Diagrams — Decision Tree + SEM Path Model

Build the remaining two diagrams.

**Files:**
- Modify: `sem_interactive/js/diagrams.js`

**Step 1: Build the statistical test decision tree**

Function `initDecisionTree()` targeting `#diagram-decision-tree`:
- D3 tree layout with nodes for each decision point
- Root: "What type is my DV?"
- Children branch based on answers: Continuous → "What type is my IV?" → etc.
- Leaf nodes are the recommended tests (t-test, ANOVA, Pearson, Mann-Whitney, etc.)
- All nodes start dimmed except root
- Click a node's answer option → highlight the path, reveal next question
- "Reset" button to start over
- Final leaf shows the test name with a brief description

Tree data structure:

```javascript
const decisionTreeData = {
  question: "What type is my DV?",
  children: [
    {
      answer: "Continuous",
      question: "What type is my IV?",
      children: [
        {
          answer: "Categorical (2 groups)",
          question: "Are parametric assumptions met?",
          children: [
            { answer: "Yes", result: "Independent t-test", description: "Compares means between two independent groups" },
            { answer: "No", result: "Mann-Whitney U", description: "Non-parametric alternative to independent t-test" }
          ]
        },
        // ... more branches for >2 groups (ANOVA/Kruskal-Wallis), continuous IV (Pearson/Spearman)
      ]
    },
    // ... branches for Categorical DV (Chi-square), Dichotomous DV
  ]
};
```

**Step 2: Build the SEM path model visualization**

Function `initSEMPathModel()` targeting `#diagram-sem-model`:
- SVG canvas showing a SEM path diagram for the stress→anxiety→performance case study
- Visual conventions:
  - Ovals = latent variables (Stress, Anxiety, Coping, Performance)
  - Rectangles = observed indicators (3 per latent variable, e.g., "Work demands", "Time pressure", "Role conflict" for Stress)
  - Single-headed arrows = paths (structural and measurement)
  - Small circles = error terms
- Build-up animation controlled by a "Next Step" button:
  1. Show latent variables only (4 ovals)
  2. Add observed indicators with measurement arrows
  3. Add structural paths between latent variables
  4. Add error terms
  5. Show path coefficients (pre-set example values)
- Hover on any element shows a tooltip with its role in the model

**Step 3: Lazy-load both diagrams**

Extend the `IntersectionObserver` pattern to initialize each diagram when its container scrolls into view.

**Step 4: Test in browser**

- Decision tree: click through options, path highlights, test name appears, reset works
- SEM model: "Next Step" reveals model components incrementally, tooltips work
- Both diagrams responsive

**Step 5: Commit**

```bash
git add sem_interactive/js/diagrams.js
git commit -m "feat: add decision tree and SEM path model diagrams"
```

---

## Task 9: BKS Data Pipeline (Python)

Create the Python script that extracts and pre-computes SEM results from BKS data.

**Files:**
- Create: `sem_interactive/scripts/prepare_bks_data.py`
- Create: `sem_interactive/scripts/pyproject.toml`
- Create: `sem_interactive/scripts/test_prepare_bks_data.py`
- Create: `sem_interactive/data/bks_excerpt.json`

**Step 1: Create pyproject.toml for the script**

```toml
[project]
name = "sem-data-prep"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "pandas>=2.0",
    "pyarrow>=14.0",
    "semopy>=2.3",
    "click>=8.0",
]

[project.optional-dependencies]
dev = ["pytest>=7.0"]
```

**Step 2: Write the failing test**

Create `test_prepare_bks_data.py`:

```python
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
    assert len(df) == 15511
    assert "opennessvariable" in df.columns


def test_select_sem_columns():
    df = load_bks_data(PARQUET_PATH)
    selected = select_sem_columns(df)
    # Should have OCEAN personality variables + other SEM-relevant columns
    assert "opennessvariable" in selected.columns
    assert "neuroticismvariable" in selected.columns
    assert "agreeablenessvariable" in selected.columns
    assert "extroversionvariable" in selected.columns
    assert "consciensiousnessvariable" in selected.columns
    # Should not have hundreds of columns
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
    # Fit indices should include the standard set
    fit = results["fit_indices"]
    assert "chi_square" in fit
    assert "cfi" in fit
    assert "rmsea" in fit


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
```

**Step 3: Run tests to verify they fail**

```bash
cd sem_interactive/scripts
uv run pytest test_prepare_bks_data.py -v
```

Expected: FAIL with `ImportError: cannot import name 'load_bks_data' from 'prepare_bks_data'`

**Step 4: Implement prepare_bks_data.py**

```python
# ABOUTME: Extracts BKS dataset columns relevant to SEM teaching and pre-computes
# ABOUTME: correlation matrices, descriptive stats, and SEM model results as JSON.

import json
from pathlib import Path

import click
import pandas as pd
import numpy as np
import semopy


# Columns suitable for a teaching SEM model:
# OCEAN personality as 5 observed indicators of a "Personality" construct,
# plus powerlessness and childhood adversity as predictors/outcomes.
SEM_COLUMNS = [
    "opennessvariable",
    "consciensiousnessvariable",
    "extroversionvariable",
    "neuroticismvariable",
    "agreeablenessvariable",
    "powerlessnessvariable",
    "age",
]

VARIABLE_DESCRIPTIONS = {
    "opennessvariable": "Openness to Experience (OCEAN personality, avg score -6 to 6)",
    "consciensiousnessvariable": "Conscientiousness (OCEAN personality, avg score -6 to 6)",
    "extroversionvariable": "Extroversion (OCEAN personality, avg score -6 to 6)",
    "neuroticismvariable": "Neuroticism (OCEAN personality, avg score -6 to 6)",
    "agreeablenessvariable": "Agreeableness (OCEAN personality, avg score -6 to 6)",
    "powerlessnessvariable": "Powerlessness (computed score, -9 to 9)",
    "age": "Respondent age in years",
}

# SEM model specification in lavaan-style syntax (used by semopy)
# A simple model: Personality latent predicted by OCEAN indicators,
# with structural path from Personality to Powerlessness
SEM_MODEL_SPEC = """
Personality =~ opennessvariable + consciensiousnessvariable + extroversionvariable + agreeablenessvariable
Personality ~ neuroticismvariable
powerlessnessvariable ~ Personality + neuroticismvariable + age
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
    return {
        "means": df.mean().round(3).to_dict(),
        "std_devs": df.std().round(3).to_dict(),
        "correlation_matrix": df.corr().round(3).to_dict(),
        "n": len(df),
        "columns": list(df.columns),
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
        fit_indices[col.lower().replace(" ", "_")] = (
            round(float(val), 4) if pd.notna(val) else None
        )

    # Rename to standard names if needed
    fit_renames = {"chi2": "chi_square"}
    for old, new in fit_renames.items():
        if old in fit_indices:
            fit_indices[new] = fit_indices.pop(old)

    # Extract parameter estimates
    estimates = model.inspect()
    path_coefficients = []
    factor_loadings = []

    for _, row in estimates.iterrows():
        entry = {
            "from": row["lval"],
            "op": row["op"],
            "to": row["rval"],
            "estimate": round(float(row["Estimate"]), 4) if pd.notna(row["Estimate"]) else None,
            "std_err": round(float(row["Std. Err"]), 4) if "Std. Err" in row and pd.notna(row.get("Std. Err")) else None,
            "p_value": round(float(row["p-value"]), 4) if "p-value" in row and pd.notna(row.get("p-value")) else None,
        }
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
```

**Step 5: Run tests to verify they pass**

```bash
cd sem_interactive/scripts
uv run pytest test_prepare_bks_data.py -v
```

Expected: All 5 tests PASS

**Step 6: Run the script to generate JSON**

```bash
cd sem_interactive/scripts
uv run python prepare_bks_data.py --parquet ../../05_survey_dataset/BKSPublic.parquet
```

Verify `sem_interactive/data/bks_excerpt.json` exists and contains expected structure.

**Step 7: Commit**

```bash
git add sem_interactive/scripts/ sem_interactive/data/bks_excerpt.json
git commit -m "feat: add BKS data pipeline with SEM pre-computation"
```

---

## Task 10: Simulation — Fit Index Explorer (Section 8)

Interactive sliders that show how fit indices change with sample size and model properties.

**Files:**
- Modify: `sem_interactive/js/simulations.js`
- Modify: `sem_interactive/css/style.css` (simulation styles)

**Step 1: Build the fit index explorer UI**

Function `initFitExplorer()` targeting `#sim-fit-explorer`:
- Three labeled sliders (`<input type="range">`):
  - Sample size: 50 to 2000 (default: 500)
  - Model complexity (number of parameters): 5 to 50 (default: 15)
  - Misspecification level: 0 (perfect) to 1 (severe), step 0.05 (default: 0.1)
- Four fit index displays (large numbers with labels):
  - Chi-square value + p-value
  - CFI
  - RMSEA
  - SRMR
- Each display has a colored background: green (good), yellow (acceptable), red (poor)

**Step 2: Implement fit index approximation functions**

These are teaching approximations, not exact statistics:

```javascript
function approximateFitIndices(sampleSize, nParams, misspec) {
    // Chi-square increases with sample size and misspecification
    const df = Math.max(1, nParams - 5);
    const chiSquare = df * (1 + misspec * 3) * (sampleSize / 200);
    const pValue = 1 - chi2cdf(chiSquare, df); // simplified approximation

    // CFI decreases with misspecification, less sensitive to sample size
    const cfi = Math.max(0, Math.min(1, 1 - misspec * 0.8 - (nParams / 200)));

    // RMSEA increases with misspecification, decreases with sample size
    const rmsea = Math.max(0, misspec * 0.15 + (nParams / sampleSize) * 0.5);

    // SRMR increases with misspecification
    const srmr = Math.max(0, misspec * 0.12 + (nParams / sampleSize) * 0.3);

    return { chiSquare, pValue, cfi, rmsea, srmr, df };
}
```

**Step 3: Wire sliders to real-time display updates**

On `input` event for any slider:
- Read all three slider values
- Call `approximateFitIndices()`
- Update the four display numbers
- Update background colors based on thresholds:
  - CFI: >=0.95 green, >=0.90 yellow, <0.90 red
  - RMSEA: <=0.05 green, <=0.08 yellow, >0.08 red
  - SRMR: <=0.05 green, <=0.08 yellow, >0.08 red
  - Chi-square p: >=0.05 green, >=0.01 yellow, <0.01 red

**Step 4: Load BKS values as starting point**

On initialization, fetch `data/bks_excerpt.json`, read the actual fit indices, and display them as a "Real BKS Model" reference row below the sliders.

**Step 5: Add simulation CSS**

```css
.simulation-container { margin: 2rem 0; padding: 1.5rem; border: 1px solid #e5e5e5; border-radius: 8px; }
.slider-group { margin-bottom: 1rem; }
.slider-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; }
.slider-group input[type="range"] { width: 100%; }
.slider-group .slider-value { font-family: var(--font-mono); color: var(--accent); }
.fit-display { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
.fit-card { padding: 1rem; border-radius: 8px; text-align: center; transition: background-color 0.3s; }
.fit-card .value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-mono); }
.fit-card .label { font-size: 0.85rem; color: var(--muted); }
.fit-card.good { background: #f0fdf4; }
.fit-card.ok { background: #fefce8; }
.fit-card.poor { background: #fef2f2; }
```

**Step 6: Lazy-load and test in browser**

Use `IntersectionObserver` to initialize when visible. Test:
- Sliders move smoothly, numbers update in real-time
- Color zones change appropriately
- BKS reference values display correctly

**Step 7: Commit**

```bash
git add sem_interactive/js/simulations.js sem_interactive/css/style.css
git commit -m "feat: add fit index explorer simulation with sliders"
```

---

## Task 11: Simulation — BKS SEM Model (Section 10)

The capstone interactive: a full SEM path diagram using pre-computed BKS results.

**Files:**
- Modify: `sem_interactive/js/simulations.js`

**Step 1: Build the BKS SEM model visualization**

Function `initBKSModel()` targeting `#sim-bks-model`:
- Load `data/bks_excerpt.json`
- Draw a D3.js SVG path diagram showing:
  - The "Personality" latent variable (oval) at center
  - OCEAN indicator rectangles connected with measurement arrows
  - Neuroticism and Age as predictors (exogenous, rectangles on left)
  - Powerlessness as outcome (rectangle on right)
  - Error terms (small circles)
- Display path coefficients on each arrow (from JSON data)
- Display fit indices in a summary bar below the diagram

**Step 2: Add standardized/unstandardized toggle**

A toggle button below the diagram:
- "Standardized" (default) vs "Unstandardized"
- Switches the coefficient values shown on paths
- Note: may need to pre-compute both in the Python script; if semopy only provides one, show just that with a note

**Step 3: Add "What If" mode**

A button "Explore: Remove a Path":
- Clicking enables "removal mode" — paths become clickable
- Clicking a path removes it (with animation) and shows how fit indices would change
- Pre-compute several model variants in the Python script (or approximate changes)
- "Reset Model" button to restore all paths
- Note: for MVP, this can show qualitative changes ("Removing this path would likely worsen fit because...") rather than exact re-computed values

**Step 4: Add hover tooltips**

Hovering any element shows:
- Variables: name, description, mean, SD (from JSON)
- Paths: coefficient, standard error, p-value, significance stars
- Fit indices: description of what each measures and its threshold

**Step 5: Lazy-load and test**

- Model diagram renders with correct topology
- Coefficients match JSON data
- Toggle switches values
- "What If" mode allows path removal with feedback
- All tooltips display correctly

**Step 6: Commit**

```bash
git add sem_interactive/js/simulations.js
git commit -m "feat: add BKS SEM model visualization with what-if exploration"
```

---

## Task 12: Polish and Accessibility

Final pass for quality, accessibility, and performance.

**Files:**
- Modify: `sem_interactive/index.html`
- Modify: `sem_interactive/css/style.css`
- Modify: all JS files as needed

**Step 1: Add ARIA labels and roles**

- All interactive elements (`button`, `input[type="range"]`) have `aria-label`
- Quiz questions have `role="group"` with `aria-labelledby`
- SVG diagrams have `role="img"` and `aria-label` describing the diagram
- Progress bar has `role="progressbar"` with `aria-valuenow`
- Glossary sidebar has `role="complementary"`

**Step 2: Add keyboard navigation**

- Quiz buttons: focusable, Enter/Space to select
- Diagram controls: Tab to buttons, Enter to activate
- Sliders: already keyboard-accessible via native `<input type="range">`
- Glossary toggle: keyboard accessible
- Skip-to-content link at top of page

**Step 3: Add responsive improvements**

- Test at 768px (tablet) and 1024px (desktop)
- Comparison grids collapse to single column below 768px
- Nav bar scrolls horizontally on small screens
- Diagram SVGs scale with container

**Step 4: Performance check**

- Verify lazy loading works (diagrams/simulations only initialize on scroll)
- Check total page weight (target: <500KB excluding D3 CDN)
- Ensure no layout shifts as sections load

**Step 5: Cross-browser test**

Open in Chrome, Firefox, Safari. Verify:
- All sections render
- All quizzes work
- All diagrams render
- All simulations respond to input
- No console errors

**Step 6: Run Lighthouse audit**

```bash
# Use Chrome DevTools Lighthouse tab
# Target: Performance >90, Accessibility >90, Best Practices >90
```

Document any issues found and fix them.

**Step 7: Commit**

```bash
git add sem_interactive/
git commit -m "feat: add accessibility, responsive polish, and performance optimizations"
```

---

## Task 13: GitHub Pages Deployment Setup

Configure the repository for GitHub Pages deployment.

**Files:**
- Create: `.github/workflows/deploy.yml` (optional, only if needed beyond basic Pages)
- Modify: repository settings (manual step)

**Step 1: Verify the site works as static files**

```bash
cd sem_interactive
python3 -m http.server 8000
```

Open `http://localhost:8000` and verify everything works when served over HTTP (not just file://).

**Step 2: Document deployment in README**

Do NOT create a README unless Doctor Dee asks. Instead, add a comment at the top of `index.html` with deployment notes.

**Step 3: Push and configure GitHub Pages**

This is a manual step for Doctor Dee:
- Push to GitHub
- Go to Settings → Pages
- Set source to main branch, folder `/5_lecturegeneration/sem_interactive`
- Or use GitHub Actions if the repo root isn't the site root

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: finalize SEM interactive site for GitHub Pages deployment"
```

---

## Summary of Tasks

| Task | Description | Depends On |
|------|-------------|------------|
| 1 | Project scaffolding | — |
| 2 | Navigation system | 1 |
| 3 | Content sections 1-2 | 1 |
| 4 | Content sections 3-5 | 3 |
| 5 | Quiz engine | 3 |
| 6 | Content sections 6-10 + glossary | 4, 5 |
| 7 | Variable relationships diagram | 4 |
| 8 | Decision tree + SEM path model diagrams | 6, 7 |
| 9 | BKS data pipeline (Python) | 1 |
| 10 | Fit index explorer simulation | 6, 9 |
| 11 | BKS SEM model simulation | 8, 9, 10 |
| 12 | Polish and accessibility | all above |
| 13 | GitHub Pages deployment | 12 |

**Parallelizable work:** Tasks 9 (Python pipeline) can run in parallel with Tasks 2-8 (HTML/JS work) since they have no shared files.
