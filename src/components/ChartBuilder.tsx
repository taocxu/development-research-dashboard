import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ReactNode } from 'react';
import {
  buildScatterGroups,
  buildSeriesData,
  getAllowedGroupColumns,
  getAllowedXColumns,
  getAllowedYColumns,
} from '../lib/chartUtils';
import type { ChartType, ColumnMeta, DataRow } from '../types';

interface ChartBuilderProps {
  rows: DataRow[];
  meta: ColumnMeta[];
  chartType: ChartType;
  xVariable: string;
  yVariable: string;
  groupVariable: string;
  onChartTypeChange: (value: ChartType) => void;
  onXVariableChange: (value: string) => void;
  onYVariableChange: (value: string) => void;
  onGroupVariableChange: (value: string) => void;
}

const palette = ['#9c5b3d', '#66734d', '#355c7d', '#c27d38', '#7a4e2d'];

const getMeta = (meta: ColumnMeta[], name: string): ColumnMeta | undefined =>
  meta.find((column) => column.name === name);

const ControlLabel = ({ children }: { children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-700">{children}</label>
);

const Select = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-copper"
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const ChartBuilder = ({
  rows,
  meta,
  chartType,
  xVariable,
  yVariable,
  groupVariable,
  onChartTypeChange,
  onXVariableChange,
  onYVariableChange,
  onGroupVariableChange,
}: ChartBuilderProps) => {
  const xMeta = getMeta(meta, xVariable);
  const numericColumns = getAllowedYColumns(meta);
  const groupColumns = getAllowedGroupColumns(meta);
  const xColumns = getAllowedXColumns(meta, chartType);

  if (rows.length === 0 || numericColumns.length === 0) {
    return <p className="text-sm text-slate-600">Upload data with numeric columns to activate the chart builder.</p>;
  }

  const groupedData = buildSeriesData(rows, xVariable, yVariable, groupVariable, xMeta);
  const scatterGroups = buildScatterGroups(rows, xVariable, yVariable, groupVariable);
  const seriesKeys = groupVariable
    ? Array.from(new Set(groupedData.flatMap((row) => Object.keys(row).filter((key) => !key.includes('__') && key !== 'x' && key !== 'sortValue'))))
    : ['All observations'];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-4">
        <ControlLabel>
          Chart type
          <Select
            value={chartType}
            onChange={(value) => onChartTypeChange(value as ChartType)}
            options={[
              { label: 'Line chart', value: 'line' },
              { label: 'Bar chart', value: 'bar' },
              { label: 'Scatter chart', value: 'scatter' },
            ]}
          />
        </ControlLabel>
        <ControlLabel>
          X variable
          <Select
            value={xVariable}
            onChange={onXVariableChange}
            options={xColumns.map((column) => ({ label: column, value: column }))}
          />
        </ControlLabel>
        <ControlLabel>
          Y variable
          <Select
            value={yVariable}
            onChange={onYVariableChange}
            options={numericColumns.map((column) => ({ label: column, value: column }))}
          />
        </ControlLabel>
        <ControlLabel>
          Group variable
          <Select
            value={groupVariable}
            onChange={onGroupVariableChange}
            options={[{ label: 'None', value: '' }, ...groupColumns.map((column) => ({ label: column, value: column }))]}
          />
        </ControlLabel>
      </div>

      <div className="h-[360px] rounded-2xl border border-stone-200 bg-stone-50/60 p-3">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend />
              {seriesKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={palette[index % palette.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend />
              {seriesKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={palette[index % palette.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
              <XAxis type="number" dataKey="x" name={xVariable} />
              <YAxis type="number" dataKey="y" name={yVariable} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              {scatterGroups.map(([label, points], index) => (
                <Scatter key={label} name={label} data={points} fill={palette[index % palette.length]} />
              ))}
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartBuilder;
