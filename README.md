# Adverse Event Signal Exploration

A beginner-friendly healthcare analytics project for exploring adverse-event reporting patterns, identifying potential safety signals, and visualizing drug-reaction relationships using descriptive data analysis.

The project focuses on understanding patterns in adverse-event reports while distinguishing statistical reporting signals from evidence of causation.

## Project Overview

Adverse-event reporting systems collect information about suspected reactions to medications. Analyzing these reports can help identify patterns that may require further investigation.

This project explores de-identified adverse-event data to:

- Clean and preprocess drug, reaction, severity, age group, and outcome fields.
- Calculate adverse-event reporting frequencies.
- Analyze serious-report proportions.
- Identify frequently reported drug-event combinations.
- Visualize reporting patterns.
- Generate a reproducible safety-signal exploration report.

**Important:** A reporting signal does not establish that a medication caused an adverse event. Findings from this project are descriptive and require expert review.

## Objectives

1. Understand and clean adverse-event reporting data.
2. Explore drug-reaction reporting patterns.
3. Calculate descriptive safety-reporting statistics.
4. Identify frequently reported drug-event combinations.
5. Communicate findings through visualizations and a reproducible notebook.

## Features

### 1. Data Cleaning
- Handle missing and inconsistent values.
- Standardize drug and reaction names.
- Clean severity, age group, and outcome fields.
- Prepare data for descriptive analysis.

### 2. Reporting Frequency Analysis
- Calculate the frequency of reported adverse events.
- Identify frequently reported drug-reaction combinations.
- Examine the distribution of reported reactions.

### 3. Serious-Report Analysis
- Calculate the proportion of reports classified as serious.
- Explore severity patterns across drugs and reactions.
- Compare reported outcomes using descriptive statistics.

### 4. Data Visualization
- Visualize frequently reported drug-event combinations.
- Display reporting frequencies using bar charts.
- Explore patterns across severity and outcome categories.

### 5. Reproducible Analysis
- Perform the analysis using a Jupyter Notebook.
- Document data cleaning and analytical steps.
- Generate reproducible tables and visualizations.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Data analysis and processing |
| Pandas | Data cleaning and manipulation |
| NumPy | Numerical operations |
| Matplotlib | Data visualization |
| Seaborn | Statistical visualization |
| Jupyter Notebook | Reproducible analysis |
