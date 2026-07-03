'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnalyticsTooltip } from './analytics-tooltips';
import type { AnalyticsChartDatum } from './analytics-utils';
import { compactNumber } from './analytics-utils';

const axisStyle = {
  fontSize: 11,
  fontWeight: 800,
  fill: '#78716c',
};

const gridStroke = '#e7e5e4';

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="mt-5 grid h-72 place-items-center rounded-3xl border border-stone-100 bg-stone-50 text-sm font-bold text-muted-foreground">
      {label}
    </div>
  );
}

export function DailyViewsLineChart({
  data,
  title,
  empty,
}: {
  data: AnalyticsChartDatum[];
  title: string;
  empty: string;
}) {
  if (data.length === 0) {
    return <EmptyChart label={empty} />;
  }
  return (
    <div className="mt-5 h-[22rem] rounded-3xl border border-white/70 bg-white/70 p-3 shadow-inner shadow-stone-100">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 22, right: 20, bottom: 12, left: 0 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="6 10" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={16} dy={10} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={axisStyle}
            tickFormatter={compactNumber}
            width={42}
          />
          <Tooltip content={<AnalyticsTooltip />} cursor={{ stroke: '#0d9488', strokeDasharray: '6 8' }} />
          <Line
            name={title}
            type="monotone"
            dataKey="value"
            stroke="#0d9488"
            strokeWidth={4}
            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#0d9488' }}
            activeDot={{ r: 7, strokeWidth: 4, fill: '#ffffff', stroke: '#0d9488' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QrScansColumnChart({
  data,
  title,
  empty,
}: {
  data: AnalyticsChartDatum[];
  title: string;
  empty: string;
}) {
  if (data.length === 0) {
    return <EmptyChart label={empty} />;
  }

  return (
    <div className="mt-5 h-[22rem] rounded-3xl border border-white/70 bg-white/70 p-3 shadow-inner shadow-stone-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 22, right: 20, bottom: 12, left: 0 }}>
          <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="6 10" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisStyle} minTickGap={16} dy={10} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={axisStyle}
            tickFormatter={compactNumber}
            width={42}
          />
          <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: 'rgba(251, 191, 36, 0.14)' }} />
          <Bar name={title} dataKey="value" radius={[14, 14, 4, 4]} barSize={34}>
            {data.map((item) => (
              <Cell key={item.label} fill="#f59e0b" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HorizontalAnalyticsChart({
  data,
  empty,
  colors,
  valueName,
}: {
  data: AnalyticsChartDatum[];
  empty: string;
  colors: string[];
  valueName: string;
}) {
  if (data.length === 0) {
    return <EmptyChart label={empty} />;
  }

  const chartHeight = Math.max(260, data.length * 58);

  return (
    <div className="mt-5 rounded-3xl border border-white/70 bg-white/70 p-3 shadow-inner shadow-stone-100">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" margin={{ top: 14, right: 18, bottom: 6, left: 8 }}>
          <CartesianGrid horizontal={false} stroke={gridStroke} strokeDasharray="6 10" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={axisStyle}
            tickFormatter={compactNumber}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={axisStyle}
            width={112}
          />
          <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: 'rgba(20, 184, 166, 0.10)' }} />
          <Bar name={valueName} dataKey="value" radius={[0, 14, 14, 0]} barSize={18}>
            {data.map((item, index) => (
              <Cell key={item.label} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContactIntentChart({
  data,
  total,
  empty,
  valueName,
}: {
  data: Array<AnalyticsChartDatum & { tone: string }>;
  total: number;
  empty: string;
  valueName: string;
}) {
  if (total === 0) {
    return <EmptyChart label={empty} />;
  }

  return (
    <div className="mt-5 h-64 rounded-3xl border border-white/70 bg-white/70 p-3 shadow-inner shadow-stone-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 14, right: 18, bottom: 6, left: 8 }}>
          <CartesianGrid horizontal={false} stroke={gridStroke} strokeDasharray="6 10" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={axisStyle}
            tickFormatter={compactNumber}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={axisStyle}
            width={104}
          />
          <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.10)' }} />
          <Bar name={valueName} dataKey="value" radius={[0, 14, 14, 0]} barSize={24}>
            {data.map((item) => (
              <Cell key={item.label} fill={item.tone} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
