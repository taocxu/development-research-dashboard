import type { DemoDatasetMetadata } from '../types';

export const worldBankMetadata: DemoDatasetMetadata = {
  "source": "World Bank World Development Indicators and related World Bank indicator series",
  "sourceNote": "Built-in demo data are drawn from the World Bank World Development Indicators and related World Bank indicator series. policy_intensity is a constructed demo index, not a World Bank indicator. Some values may be missing because of country-year coverage. Use uploaded CSV data for substantive analysis.",
  "sourceNoteZh": "内置示范数据来自世界银行 World Development Indicators 及相关世界银行指标序列。policy_intensity 为构造性的示范指数，并非世界银行原始指标。部分数值可能因国家年份覆盖差异而缺失。正式分析请上传你自己的 CSV 数据。",
  "countries": [
    "BRA",
    "CHN",
    "ETH",
    "IND",
    "POL",
    "RWA",
    "VNM",
    "ZAF"
  ],
  "years": [
    2015,
    2016,
    2017,
    2018,
    2019,
    2020,
    2021,
    2022,
    2023
  ],
  "indicatorCodes": [
    "NY.GDP.PCAP.CD",
    "NV.IND.TOTL.ZS",
    "NV.IND.MANF.ZS",
    "NE.EXP.GNFS.ZS",
    "SP.URB.TOTL.IN.ZS",
    "IP.PAT.RESD",
    "SL.EMP.TOTL.SP.ZS",
    "GE.EST"
  ],
  "indicatorLabels": {
    "gdp_per_capita": "GDP per capita, current US$",
    "industrial_share": "Industry, including construction, value added (% of GDP)",
    "manufacturing_share": "Manufacturing, value added (% of GDP)",
    "export_share": "Exports of goods and services (% of GDP)",
    "urbanisation": "Urban population (% of total population)",
    "patents": "Patent applications, residents",
    "employment_rate": "Employment to population ratio, 15+, total (%) (modelled ILO estimate)",
    "policy_intensity": "Constructed demo index, not a World Bank indicator"
  },
  "lastRefreshed": "2026-06-10",
  "geEstFetched": false,
  "institutionalQualityIncluded": false,
  "policyIntensityIncluded": true,
  "policyIntensityFormula": "policy_intensity = rescale_0_10(avg(z(manufacturing_share), z(export_share)))",
  "policyIntensityComponents": [
    "manufacturing_share",
    "export_share"
  ],
  "rowCount": 72,
  "omittedIndicators": [
    "GE.EST"
  ]
};
