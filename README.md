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

- Built-in World Bank WDI demo dataset for a compact country-year development panel.
- Local CSV upload and parsing with PapaParse.
- Automatic inference of numeric, categorical, and year-like columns.
- Summary cards for observations, variables, missingness, and year range.
- Full-width chart builder and chart display with line, bar, and scatter support.
- Data preview table for the first 20 rows.
- Descriptive statistics for numeric columns only.
- Correlation matrix for numeric columns only.
- CSV export for descriptive statistics and the current dataset.
- Local persistence of the latest dataset through `localStorage`.

## Local installation commands

```bash
npm install
npm run refresh:data
npm run dev
npm run build
```

Run the commands from:

```bash
cd development-research-dashboard
```

## GitHub Pages deployment instructions

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

The Vite base path is set to `/development-research-dashboard/` in `vite.config.ts`. If your GitHub repository uses a different name, update that `base` value before deploying.

1. Push the repository to GitHub.
2. In the repository settings, enable GitHub Pages and select `GitHub Actions` as the source.
3. Push changes to the default branch. The workflow will install dependencies, build the Vite app, and publish the generated `dist` directory.

## Built-in World Bank demo dataset

Data source: The World Bank, World Development Indicators and related World Bank indicator series, accessed through the World Bank Indicators API.

- Countries: `BRA`, `CHN`, `ETH`, `IND`, `POL`, `RWA`, `VNM`, `ZAF`
- Years: `2015` to `2023`
- Indicators requested:
  - `NY.GDP.PCAP.CD` → `gdp_per_capita`
  - `NV.IND.TOTL.ZS` → `industrial_share`
  - `NV.IND.MANF.ZS` → `manufacturing_share`
  - `NE.EXP.GNFS.ZS` → `export_share`
  - `SP.URB.TOTL.IN.ZS` → `urbanisation`
  - `IP.PAT.RESD` → `patents`
  - `SL.EMP.TOTL.SP.ZS` → `employment_rate`
  - `GE.EST` → `institutional_quality` when available

Missing values are preserved as `null`. The dashboard does not interpolate, backfill, fabricate, or silently replace missing country-year values with zero.

### `policy_intensity`

`policy_intensity` is a constructed demo index, not a World Bank indicator.

- Preferred formula:
  `policy_intensity = rescale_0_10(avg(z(manufacturing_share), z(export_share), z(institutional_quality)))`
- Current fallback formula when `GE.EST` is unavailable:
  `policy_intensity = rescale_0_10(avg(z(manufacturing_share), z(export_share)))`
- Current implementation status:
  `GE.EST` was not fetched successfully during the latest refresh, so `institutional_quality` is omitted from the built-in panel and `policy_intensity` currently uses `manufacturing_share` plus `export_share` only.

Refresh the committed demo data locally with:

```bash
npm run refresh:data
```

## Output fields

- Summary cards: observations, variables, numeric variables, categorical variables, missing cells, year range.
- Data preview: first 20 rows of the loaded dataset.
- Descriptive statistics: mean, standard deviation, minimum, median, maximum, missing count.
- Correlation matrix: pairwise correlations across inferred numeric variables, capped at the first 10 numeric columns for readability.
- Export files: `descriptive_statistics.csv` and `current_dataset.csv`.

## Limitations

- This dashboard is not a causal inference tool.
- It does not estimate regressions, structural models, or treatment effects.
- It assumes a rectangular CSV structure and modest file sizes suitable for browser-based processing.
- It has no backend, no login, no external API, and no database.
- The built-in demo panel is intended for exploratory analysis only; substantive research should use uploaded project-specific data and formal econometric workflows in Stata, R, or Python.

## Future roadmap

- Stronger CSV validation and column diagnostics.
- Additional export formats for summary tables and figures.
- More explicit handling of panel identifiers and duplicate observations.
- Optional client-side filtering for large exploratory tables.

- ## References

Xu, T., & Hu, Y. (2024). Towards Sustainable Prosperity? Policy Evaluation of Jiangsu Advanced Manufacturing Clusters. Technology in Society, 77, 102583. https://doi.org/10.1016/j.techsoc.2024.102583
Xu, T., & Zhu, Y. (2025). Why Cities Backfire? High-Speed Railway New Town Planning and Urban Structural Change. https://doi.org/10.21203/rs.3.rs-7374795/v2
Xu, T., & Zhu, W. (2025). When Polanyi Met Schumpeter: Social Trust and Entrepreneurship. https://mpra.ub.uni-muenchen.de/123894
Xu, T. (2024). The Third Way: Reinterpreting the Political Settlements Framework with Structuration Theory https://doi.org/10.31219/osf.io/nmvhq
Xu, T. (2024). The Road Not Taken? Industrial Policy and Political Settlements in China and Indonesia 1990–2022. https://mpra.ub.uni-muenchen.de/122669
Wang, Y., & Xu, T. (2024). It Takes Three to Ceilidh: Pension System and Multidimensional Poverty Mitigation in China. https://doi.org/10.48550/arXiv.2411.02807
Xu, T., & Hu, Z. (2022). Peasant Life in Changing China: Rural Pension System Reform and Social Insurance Participation. https://doi.org/10.48550/arXiv.2204.00785

