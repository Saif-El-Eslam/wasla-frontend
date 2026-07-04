import type { AnalyticsSummary, LocalizedValue } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';

export type Period = '7d' | '30d' | 'custom';

export type AnalyticsChartDatum = {
  label: string;
  value: number;
  views?: number;
  scans?: number;
  percentage?: number;
  percentageLabel?: string;
  slug?: string;
  rank?: number;
};

export function compactNumber(value: number) {
  return new Intl.NumberFormat('en', {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function changeCopy(change: number, period: Period) {
  const sign = change > 0 ? '+' : '';

  if (period === 'custom') {
    return `${sign}${change}% vs previous range`;
  }

  return `${sign}${change}% vs previous ${period}`;
}

export function changeTone(change: number) {
  if (change > 0) {
    return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  }

  if (change < 0) {
    return 'text-rose-700 bg-rose-50 border-rose-100';
  }

  return 'text-stone-700 bg-stone-50 border-stone-100';
}

export function metricCurrent(
  metrics: AnalyticsSummary['metrics'] | undefined,
  key: keyof AnalyticsSummary['metrics'],
) {
  return metrics?.[key]?.current ?? 0;
}

export function metricChange(
  metrics: AnalyticsSummary['metrics'] | undefined,
  key: keyof AnalyticsSummary['metrics'],
) {
  return metrics?.[key]?.change ?? 0;
}

export function branchLabel(name: LocalizedValue, slug: string, locale: string) {
  return textForLocale(name, locale) || slug;
}

export function topDatum(data: AnalyticsChartDatum[]) {
  return data.reduce<AnalyticsChartDatum | null>((best, item) => (!best || item.value > best.value ? item : best), null);
}
