import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceNote =
  'Built-in demo data are drawn from the World Bank World Development Indicators and related World Bank indicator series. policy_intensity is a constructed demo index, not a World Bank indicator. Some values may be missing because of country-year coverage. Use uploaded CSV data for substantive analysis.';
const sourceNoteZh =
  '内置示范数据来自世界银行 World Development Indicators 及相关世界银行指标序列。policy_intensity 为构造性的示范指数，并非世界银行原始指标。部分数值可能因国家年份覆盖差异而缺失。正式分析请上传你自己的 CSV 数据。';

const countries = [
  { code: 'BRA', country: 'Brazil', region: 'Latin America and Caribbean' },
  { code: 'CHN', country: 'China', region: 'East Asia and Pacific' },
  { code: 'ETH', country: 'Ethiopia', region: 'Sub-Saharan Africa' },
  { code: 'IND', country: 'India', region: 'South Asia' },
  { code: 'POL', country: 'Poland', region: 'Europe and Central Asia' },
  { code: 'RWA', country: 'Rwanda', region: 'Sub-Saharan Africa' },
  { code: 'VNM', country: 'Vietnam', region: 'East Asia and Pacific' },
  { code: 'ZAF', country: 'South Africa', region: 'Sub-Saharan Africa' },
];

const years = Array.from({ length: 9 }, (_, index) => 2015 + index);

const indicators = [
  ['NY.GDP.PCAP.CD', 'gdp_per_capita', 'GDP per capita, current US$'],
  ['NV.IND.TOTL.ZS', 'industrial_share', 'Industry, including construction, value added (% of GDP)'],
  ['NV.IND.MANF.ZS', 'manufacturing_share', 'Manufacturing, value added (% of GDP)'],
  ['NE.EXP.GNFS.ZS', 'export_share', 'Exports of goods and services (% of GDP)'],
  ['SP.URB.TOTL.IN.ZS', 'urbanisation', 'Urban population (% of total population)'],
  ['IP.PAT.RESD', 'patents', 'Patent applications, residents'],
  [
    'SL.EMP.TOTL.SP.ZS',
    'employment_rate',
    'Employment to population ratio, 15+, total (%) (modelled ILO estimate)',
  ],
  ['GE.EST', 'institutional_quality', 'Government Effectiveness: Estimate'],
];

const round = (value, digits = 3) =>
  value === null || value === undefined || Number.isNaN(value) ? null : Number(value.toFixed(digits));

const zScores = (rows, field) => {
  const values = rows.map((row) => row[field]).filter((value) => typeof value === 'number');
  if (values.length < 2) {
    return new Map();
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  const std = Math.sqrt(variance);
  if (!Number.isFinite(std) || std === 0) {
    return new Map();
  }

  return new Map(
    rows
      .map((row, index) =>
        typeof row[field] === 'number'
          ? [`${row.country_code}-${row.year}-${index}`, (row[field] - mean) / std]
          : null,
      )
      .filter(Boolean),
  );
};

const buildPolicyIntensity = (rows, institutionalQualityIncluded) => {
  const components = institutionalQualityIncluded
    ? ['manufacturing_share', 'export_share', 'institutional_quality']
    : ['manufacturing_share', 'export_share'];

  const zScoreMaps = Object.fromEntries(components.map((field) => [field, zScores(rows, field)]));
  const scoredRows = rows.map((row, index) => {
    const key = `${row.country_code}-${row.year}-${index}`;
    const values = components
      .map((field) => zScoreMaps[field].get(key))
      .filter((value) => typeof value === 'number');

    if (values.length < 2) {
      return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  });

  const validScores = scoredRows.filter((value) => typeof value === 'number');
  if (validScores.length === 0) {
    return { rows, formula: null, components };
  }

  const min = Math.min(...validScores);
  const max = Math.max(...validScores);
  const scale = max - min;

  const nextRows = rows.map((row, index) => {
    const score = scoredRows[index];
    if (typeof score !== 'number') {
      return { ...row, policy_intensity: null };
    }

    const rescaled = scale === 0 ? 5 : ((score - min) / scale) * 10;
    return { ...row, policy_intensity: round(rescaled, 3) };
  });

  const formula = institutionalQualityIncluded
    ? 'policy_intensity = rescale_0_10(avg(z(manufacturing_share), z(export_share), z(institutional_quality)))'
    : 'policy_intensity = rescale_0_10(avg(z(manufacturing_share), z(export_share)))';

  return { rows: nextRows, formula, components };
};

const fetchIndicator = async (code) => {
  const countryList = countries.map((entry) => entry.code).join(';');
  const url = `https://api.worldbank.org/v2/country/${countryList}/indicator/${code}?date=2015:2023&format=json&per_page=20000`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`World Bank API request failed for ${code}: ${response.status}`);
  }

  const json = await response.json();
  const records = Array.isArray(json) ? json[1] : null;
  if (!Array.isArray(records)) {
    throw new Error(`Unexpected World Bank response for ${code}`);
  }

  return records;
};

const buildBaseRow = (countryInfo, year) => ({
  country: countryInfo.country,
  country_code: countryInfo.code,
  year,
  region: countryInfo.region,
  gdp_per_capita: null,
  industrial_share: null,
  manufacturing_share: null,
  export_share: null,
  urbanisation: null,
  patents: null,
  employment_rate: null,
  institutional_quality: null,
});

const buildRows = async () => {
  const panel = new Map();
  const labels = {};
  const omittedIndicators = [];
  let geEstFetched = false;

  for (const [code, field, label] of indicators) {
    labels[field] = label;

    try {
      const records = await fetchIndicator(code);
      if (code === 'GE.EST') {
        geEstFetched = true;
      }

      records.forEach((entry) => {
        const countryCode = entry.countryiso3code;
        const year = Number(entry.date);
        if (!countryCode || !years.includes(year)) {
          return;
        }

        const countryInfo = countries.find((item) => item.code === countryCode);
        if (!countryInfo) {
          return;
        }

        const key = `${countryCode}-${year}`;
        const existing = panel.get(key) ?? buildBaseRow(countryInfo, year);
        existing[field] = entry.value === null ? null : round(Number(entry.value), field === 'patents' ? 0 : 3);
        panel.set(key, existing);
      });
    } catch (error) {
      if (code === 'GE.EST') {
        omittedIndicators.push('GE.EST');
        continue;
      }

      throw error;
    }
  }

  const rows = countries.flatMap((countryInfo) =>
    years.map((year) => {
      const key = `${countryInfo.code}-${year}`;
      return panel.get(key) ?? buildBaseRow(countryInfo, year);
    }),
  );

  const usableRows = rows.filter((row) =>
    [
      row.gdp_per_capita,
      row.industrial_share,
      row.manufacturing_share,
      row.export_share,
      row.urbanisation,
      row.patents,
      row.employment_rate,
      row.institutional_quality,
    ].some((value) => value !== null),
  );

  const institutionalQualityIncluded = geEstFetched && usableRows.some((row) => row.institutional_quality !== null);
  const { rows: rowsWithPolicy, formula, components } = buildPolicyIntensity(usableRows, institutionalQualityIncluded);

  return {
    rows: rowsWithPolicy,
    geEstFetched,
    institutionalQualityIncluded,
    policyIntensityFormula: formula,
    policyIntensityComponents: components,
    indicatorLabels: labels,
    omittedIndicators,
  };
};

const main = async () => {
  const {
    rows,
    geEstFetched,
    institutionalQualityIncluded,
    policyIntensityFormula,
    policyIntensityComponents,
    indicatorLabels,
    omittedIndicators,
  } = await buildRows();

  const metadataIndicatorLabels = { ...indicatorLabels };
  if (!institutionalQualityIncluded) {
    delete metadataIndicatorLabels.institutional_quality;
  }

  const metadata = {
    source: 'World Bank World Development Indicators and related World Bank indicator series',
    sourceNote,
    sourceNoteZh,
    countries: countries.map((entry) => entry.code),
    years,
    indicatorCodes: indicators.map(([code]) => code),
    indicatorLabels: {
      ...metadataIndicatorLabels,
      policy_intensity: 'Constructed demo index, not a World Bank indicator',
    },
    lastRefreshed: new Date().toISOString().slice(0, 10),
    geEstFetched,
    institutionalQualityIncluded,
    policyIntensityIncluded: true,
    policyIntensityFormula,
    policyIntensityComponents,
    rowCount: rows.length,
    omittedIndicators,
  };

  const builtInRows = rows.map((row) => {
    const nextRow = {
      country: row.country,
      country_code: row.country_code,
      year: row.year,
      region: row.region,
      gdp_per_capita: row.gdp_per_capita,
      industrial_share: row.industrial_share,
      manufacturing_share: row.manufacturing_share,
      export_share: row.export_share,
      urbanisation: row.urbanisation,
      patents: row.patents,
      employment_rate: row.employment_rate,
      policy_intensity: row.policy_intensity,
    };

    if (institutionalQualityIncluded) {
      nextRow.institutional_quality = row.institutional_quality;
    }

    return nextRow;
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const srcDataDir = path.resolve(__dirname, '../src/data');
  await mkdir(srcDataDir, { recursive: true });

  await writeFile(
    path.join(srcDataDir, 'worldBankSample.ts'),
    `import type { DataRow } from '../types';\n\nexport const worldBankSampleRows: DataRow[] = ${JSON.stringify(builtInRows, null, 2)};\n`,
    'utf8',
  );

  await writeFile(
    path.join(srcDataDir, 'worldBankMetadata.ts'),
    `import type { DemoDatasetMetadata } from '../types';\n\nexport const worldBankMetadata: DemoDatasetMetadata = ${JSON.stringify(metadata, null, 2)};\n`,
    'utf8',
  );

  console.log(`World Bank sample dataset refreshed: ${rows.length} rows`);
  console.log(`GE.EST fetched: ${geEstFetched ? 'yes' : 'no'}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
