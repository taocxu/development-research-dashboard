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
import { buildScatterGroups, buildSeriesData, getTopGroupValues } from '../lib/chartUtils';
import type { ChartType, ColumnMeta, DataRow } from '../types';

interface ChartDisplayProps {
  rows: DataRow[];
  meta: ColumnMeta[];
  chartType: ChartType;
  xVariable: string;
  yVariable: string;
  groupVariable: string;
}

const palette = ['#2563eb', '#4f46e5', '#0f766e', '#b45309', '#9333ea', '#475569', '#be123c', '#0369a1'];

const getMeta = (meta: ColumnMeta[], name: string): ColumnMeta | undefined =>
  meta.find((column) => column.name === name);

const renderLegend = (value: string) => <span className="text-xs font-medium text-slate-600">{value}</span>;

const ChartDisplay = ({ rows, meta, chartType, xVariable, yVariable, groupVariable }: ChartDisplayProps) => {
  const xMeta = getMeta(meta, xVariable);
  const allowedGroups = getTopGroupValues(rows, groupVariable, 8);
  const filteredRows =
    groupVariable && allowedGroups.length > 0
      ? rows.filter((row) => allowedGroups.includes(String(row[groupVariable] ?? '')))
      : rows;

  const groupedData = buildSeriesData(filteredRows, xVariable, yVariable, groupVariable, xMeta);
  const scatterGroups = buildScatterGroups(filteredRows, xVariable, yVariable, groupVariable);
  const seriesKeys = groupVariable
    ? Array.from(
        new Set(
          groupedData.flatMap((row) =>
            Object.keys(row).filter((key) => !key.includes('__') && key !== 'x' && key !== 'sortValue'),
          ),
        ),
      )
    : ['All observations'];

  if (rows.length === 0 || !xVariable || !yVariable) {
    return <p className="text-sm text-slate-600">Load a dataset to render an exploratory chart.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">
            {chartType[0].toUpperCase() + chartType.slice(1)} chart: {yVariable} by {xVariable}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Grouping {groupVariable ? `by ${groupVariable}` : 'is turned off'}.
          </p>
        </div>
        {groupVariable && allowedGroups.length > 0 ? (
          <p className="max-w-md text-xs text-slate-500">
            Showing the first {allowedGroups.length} {groupVariable} categories by frequency to keep the legend readable.
          </p>
        ) : null}
      </div>

      <div className="h-[420px] rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={groupedData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
              <XAxis dataKey="x" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip />
              <Legend verticalAlign="top" align="left" wrapperStyle={{ paddingBottom: 12 }} formatter={renderLegend} />
              {seriesKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={palette[index % palette.length]}
                  strokeWidth={2.25}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={groupedData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
              <XAxis dataKey="x" tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip />
              <Legend verticalAlign="top" align="left" wrapperStyle={{ paddingBottom: 12 }} formatter={renderLegend} />
              {seriesKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={palette[index % palette.length]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          ) : (
            <ScatterChart margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
              <XAxis type="number" dataKey="x" name={xVariable} tick={{ fontSize: 12, fill: '#475569' }} />
              <YAxis type="number" dataKey="y" name={yVariable} tick={{ fontSize: 12, fill: '#475569' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend verticalAlign="top" align="left" wrapperStyle={{ paddingBottom: 12 }} formatter={renderLegend} />
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

export default ChartDisplay;
