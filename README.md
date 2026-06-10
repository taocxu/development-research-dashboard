# Development Research Dashboard

Development Research Dashboard is a static exploratory web application for rapid inspection of structured development datasets before formal econometric analysis.

## Research use cases

- Early-stage inspection of country-year development panels.
- Preliminary review of city-year urban and industrial datasets.
- Rapid screening of firm-year production, export, and employment records.
- First-pass diagnosis of policy-coding and institutional change data.

## Supported data structures

- Country-year datasets.
- City-year datasets.
- Firm-year datasets.
- Policy-coding datasets in rectangular CSV format.

## Main features

- Built-in synthetic sample dataset covering development, industrial policy, and institutional change variables.
- Local CSV upload and parsing with PapaParse.
- Automatic inference of numeric, categorical, and year-like columns.
- Summary cards for observations, variables, missingness, and year range.
- Data preview table for the first 20 rows.
- Line, bar, and scatter charts with selectable variables and grouping.
- Descriptive statistics for numeric columns only.
- Correlation matrix for numeric columns only.
- CSV export for descriptive statistics.
- Local persistence of the latest dataset through `localStorage`.

## Local installation commands

```bash
npm install
npm run dev
npm run build
```

Run the commands from:

```bash
cd development-research-dashboard
```

## GitHub Pages deployment instructions

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-development-research-dashboard.yml`.

The Vite base path is set to `/development-research-dashboard/` in `vite.config.ts`. If your GitHub repository uses a different name, update that `base` value before deploying.

1. Push the repository to GitHub.
2. In the repository settings, enable GitHub Pages and select `GitHub Actions` as the source.
3. Ensure the default branch contains the `development-research-dashboard` folder and the workflow file.
4. Push changes to the default branch. The workflow will install dependencies, build the Vite app, and publish the generated `dist` directory.

## Output fields

- Summary cards: observations, variables, numeric variables, categorical variables, missing cells, year range.
- Data preview: first 20 rows of the loaded dataset.
- Descriptive statistics: mean, standard deviation, minimum, median, maximum, missing count.
- Correlation matrix: pairwise correlations across inferred numeric variables.
- Export file: `descriptive-statistics.csv`.

## Limitations

- This dashboard is not a causal inference tool.
- It does not estimate regressions, structural models, or treatment effects.
- It assumes a rectangular CSV structure and modest file sizes suitable for browser-based processing.
- It has no backend, no login, no external API, and no database.

## Future roadmap

- Stronger CSV validation and column diagnostics.
- Additional export formats for summary tables and figures.
- More explicit handling of panel identifiers and duplicate observations.
- Optional client-side filtering for large exploratory tables.
