# Interactive SEM Educational Web Page — Design Document

**Date**: 2026-02-27
**Author**: Doctor Dee + Claude
**Status**: Approved

## Overview

Transform the SEM presentation content (`SEM_Presentation_Content.md`) into a full-featured interactive web page for psychology students encountering Structural Equation Modeling for the first time.

## Requirements

- **Audience**: Psychology undergrad/postgrad students new to SEM
- **Interactivity**: Three layers — quizzes, visual diagrams, simulations
- **Deployment**: GitHub Pages (static site)
- **Navigation**: Linear but open (ordered content, free jump via nav)
- **Style**: Minimal academic (clean typography, content-first)
- **Data**: BKS dataset excerpts for real-world examples

## Site Structure

```
5_lecturegeneration/sem_interactive/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── quiz.js
│   ├── diagrams.js
│   ├── simulations.js
│   └── navigation.js
├── data/
│   └── bks_excerpt.json
├── scripts/
│   └── prepare_bks_data.py
└── assets/
```

### Navigation

- Single long-scrolling page
- Fixed top nav bar with section titles (clickable)
- Progress bar at top showing scroll position
- Smooth scroll between sections
- Each section is a distinct visual block

### Content Sections

1. Welcome and Learning Objectives
2. Data Types Foundation (with quiz)
3. Understanding Variables (with interactive diagram)
4. Parametric vs Non-Parametric Tests (with decision tree)
5. Introduction to SEM (with history timeline)
6. Key Concepts and Latent Variables (with visual model)
7. SEM Analysis Process (with step-by-step walkthrough)
8. Model Fit and Indices (with simulation)
9. Software and Tools (reference section)
10. Case Study (with full interactive SEM model using BKS data)

## Visual Design

### Typography

- Body: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`)
- Headings: Serif via Google Fonts (`Crimson Pro` or `Source Serif Pro`)
- Technical terms: Monospace
- Base size: 18px, line-height 1.6

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background | Warm off-white | `#fafaf8` |
| Text | Near-black | `#2d2d2d` |
| Accent | Calm blue | `#2563eb` |
| Success | Green | `#16a34a` |
| Error | Red | `#dc2626` |
| Muted | Gray | `#6b7280` |

### Layout

- Max content width: 720px
- Generous whitespace between sections
- Cards/panels with subtle borders for interactive elements
- Flat design, no heavy shadows or gradients
- Desktop and tablet friendly; mobile-functional but not mobile-optimized

## Interactive Components

### Layer 1: Quizzes and Self-Checks

Multiple choice cards with instant feedback. Low-stakes, formative assessment. Wrong answers show explanations. Questions appear inline within content flow.

**Locations**:
- Section 2: "Identify the data type" (5 questions)
- Section 6: "Which is a latent variable?" quiz
- Section 7: "Identify the assumption violation" scenarios
- Section 8: "Which model fits best?" comparison exercise

### Layer 2: Interactive Visual Diagrams

**Diagram 1 — Variable Relationships** (Section 3):
SVG diagram showing IV to DV relationship. Click/hover for definitions. Buttons to add mediator/moderator to build complexity incrementally.

**Diagram 2 — Statistical Test Decision Tree** (Section 4):
Interactive flowchart where students answer questions about their data. Tree highlights the path and reveals the recommended test. D3.js tree layout.

**Diagram 3 — SEM Path Model Builder** (Sections 6-7):
Visual canvas with latent variables (ovals), observed variables (rectangles), paths (arrows). Pre-built stress-anxiety-performance example. Hover for coefficients, click for indicators. Animated build-up revealing model specification step by step.

### Layer 3: Simulations

**Simulation 1 — Fit Index Explorer** (Section 8):
Sliders for sample size, model complexity, misspecification. Real-time display of Chi-square, CFI, RMSEA, SRMR changes. Green/yellow/red zones for acceptable ranges. Pre-loaded with BKS case study values.

**Simulation 2 — SEM Model with BKS Data** (Section 10):
Full SEM model using actual BKS variables. Shows path coefficients, fit indices, factor loadings. Toggle standardized/unstandardized estimates. "What if" mode: remove paths and see fit changes.

## Educational Approach

- **Scaffolding**: Foundational concepts before SEM-specific material
- **Active recall**: Quizzes after content, wrong answers link back to relevant sections
- **Worked examples then practice**: Explain, show example, let student try
- **Progressive disclosure**: Complex topics revealed in stages (student controls pace)
- **Signposting**: "What you'll learn" callout at section start, "Key takeaway" box at end
- **Jargon management**: Technical terms styled distinctly, tooltipped on first use, collapsible glossary sidebar

## Technical Details

### Dependencies

- D3.js v7 (CDN) — diagrams, decision tree, path models, simulations
- No other frameworks — vanilla JS for quizzes, navigation, and simulation logic

### BKS Data Pipeline

1. `prepare_bks_data.py` reads `BKSPublic.parquet`
2. Selects relevant columns for the case study SEM model
3. Computes correlation/covariance matrices and summary statistics
4. Pre-runs SEM using `semopy` to get path coefficients, fit indices, factor loadings
5. Exports to `data/bks_excerpt.json` (target: under 100KB)
6. Browser loads JSON — no stats computation in browser

### Performance Targets

- No build step
- All diagrams in SVG
- Lazy-load simulations on scroll-into-view
- Total page weight under 500KB (excluding D3 CDN)

### Accessibility

- Semantic HTML5 (`section`, `article`, `nav`, `figure`)
- ARIA labels on interactive elements
- Keyboard navigation for quizzes and simulations
- WCAG AA color contrast minimum
- Alt text on all diagrams

### Testing

- Python: pytest for data preparation script
- Browser: manual testing across Chrome, Firefox, Safari
- Accessibility: Lighthouse audit
