import type { ReactNode } from 'react';
import { getAllowedGroupColumns, getAllowedXColumns, getAllowedYColumns } from '../lib/chartUtils';
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
    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
  const numericColumns = getAllowedYColumns(meta);
  const groupColumns = getAllowedGroupColumns(meta);
  const xColumns = getAllowedXColumns(meta, chartType);

  if (rows.length === 0 || numericColumns.length === 0) {
    return <p className="text-sm text-slate-600">Upload data with numeric columns to activate the chart builder.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-600">
          Configure the chart type and variable mapping below. Chinese translations are moved out of the controls to keep the selectors readable.
        </p>
        <p className="mt-1 text-xs text-slate-500">在下方设置图表类型与变量映射，控件区保持紧凑清晰，避免中英文标签挤压。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ControlLabel>
          Chart type
          <span className="text-xs text-slate-500">图表类型</span>
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
          <span className="text-xs text-slate-500">横轴变量</span>
          <Select
            value={xVariable}
            onChange={onXVariableChange}
            options={xColumns.map((column) => ({ label: column, value: column }))}
          />
        </ControlLabel>
        <ControlLabel>
          Y variable
          <span className="text-xs text-slate-500">纵轴变量</span>
          <Select
            value={yVariable}
            onChange={onYVariableChange}
            options={numericColumns.map((column) => ({ label: column, value: column }))}
          />
        </ControlLabel>
        <ControlLabel>
          Group variable
          <span className="text-xs text-slate-500">分组变量</span>
          <Select
            value={groupVariable}
            onChange={onGroupVariableChange}
            options={[{ label: 'None', value: '' }, ...groupColumns.map((column) => ({ label: column, value: column }))]}
          />
        </ControlLabel>
      </div>
    </div>
  );
};

export default ChartBuilder;
