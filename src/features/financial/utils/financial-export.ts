import type { LocalizedValue } from '@/lib/api';
import { textForLocale } from '@/lib/localized-text';
import type { FinancialReportResponse } from '../types/financial.types';
import { formatFinanceAmount } from './financial-format';

export type ExportCell = string | number;
export type ExportRow = ExportCell[];

export type ExportSection = {
  title: string;
  headers?: ExportRow;
  rows: ExportRow[];
};

export type ReportCsvLabels = {
  branch: string;
  branchReport: string;
  category: string;
  categoryReport: string;
  expense: string;
  expenses: string;
  group: string;
  groupSummary: string;
  income: string;
  metric: string;
  name: string;
  net: string;
  overview: string;
  paymentMethod: string;
  paymentMethodReport: string;
  summary: string;
  total: string;
  transactions: string;
  type: string;
  value: string;
};

export type ReportExportGroup = {
  key: string;
  label: LocalizedValue | string;
  income: number;
  expenses: number;
  net: number;
  count: number;
};

type ReportData = FinancialReportResponse['report'];

function downloadTextFile(filename: string, mimeType: string, content: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: ExportCell) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function sectionToCsv(section: ExportSection) {
  const rows: ExportRow[] = [
    [],
    [`========== ${section.title.toUpperCase()} ==========`],
    ...(section.headers ? [section.headers] : []),
    ...section.rows,
  ];

  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

function reportCsvContent(title: string, sections: ExportSection[]) {
  return `\uFEFF${[
    [`========== ${title.toUpperCase()} ==========`].map(csvCell).join(','),
    ...sections.map(sectionToCsv),
  ].join('\n')}`;
}

export function downloadReportCsv(filename: string, title: string, sections: ExportSection[]) {
  downloadTextFile(filename, 'text/csv;charset=utf-8', reportCsvContent(title, sections));
}

export async function shareReportCsv(filename: string, title: string, sections: ExportSection[]) {
  const csv = reportCsvContent(title, sections);
  const file = new File([csv], filename, { type: 'text/csv' });
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
    share?: (data: ShareData) => Promise<void>;
  };

  if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
    await nav.share({
      title,
      text: title,
      files: [file],
    });
    return;
  }

  downloadTextFile(filename, 'text/csv;charset=utf-8', csv);
}

export function groupLabel(group: ReportExportGroup, locale: string) {
  return textForLocale(group.label, locale) || group.key;
}

export function groupSections(
  group: ReportExportGroup,
  currency: string,
  labels: ReportCsvLabels,
): ExportSection[] {
  return [{
    title: labels.groupSummary,
    headers: [labels.metric, labels.value],
    rows: [
      [labels.transactions, group.count],
      [labels.income, formatFinanceAmount(group.income, currency)],
      [labels.expenses, formatFinanceAmount(group.expenses, currency)],
      [labels.net, formatFinanceAmount(group.net, currency)],
    ],
  }];
}

export function overviewSections(
  groups: ReportExportGroup[],
  locale: string,
  currency: string,
  labels: ReportCsvLabels,
): ExportSection[] {
  return [{
    title: labels.overview,
    headers: [labels.group, labels.transactions, labels.income, labels.expenses, labels.net],
    rows: groups.map((group) => [
      groupLabel(group, locale),
      group.count,
      formatFinanceAmount(group.income, currency),
      formatFinanceAmount(group.expenses, currency),
      formatFinanceAmount(group.net, currency),
    ]),
  }];
}

export function reportSections(
  report: ReportData,
  locale: string,
  currency: string,
  labels: ReportCsvLabels,
): ExportSection[] {
  return [
    {
      title: labels.summary,
      headers: [labels.name, labels.transactions, labels.income, labels.expenses, labels.net],
      rows: [[
        labels.total,
        report.summary.count,
        formatFinanceAmount(report.summary.income, currency),
        formatFinanceAmount(report.summary.expenses, currency),
        formatFinanceAmount(report.summary.net, currency),
      ]],
    },
    {
      title: labels.categoryReport,
      headers: [labels.category, labels.type, labels.transactions, labels.income, labels.expenses],
      rows: report.byCategory.map((item) => [
        textForLocale(item.name, locale),
        item.type === 'IN' ? labels.income : labels.expense,
        item.count,
        item.type === 'IN' ? formatFinanceAmount(item.amount, currency) : '',
        item.type === 'OUT' ? formatFinanceAmount(item.amount, currency) : '',
      ]),
    },
    {
      title: labels.branchReport,
      headers: [labels.branch, labels.transactions, labels.income, labels.expenses, labels.net],
      rows: report.byBranch.map((item) => [
        textForLocale(item.name, locale),
        item.count,
        formatFinanceAmount(item.income, currency),
        formatFinanceAmount(item.expenses, currency),
        formatFinanceAmount(item.net, currency),
      ]),
    },
    {
      title: labels.paymentMethodReport,
      headers: [labels.paymentMethod, labels.transactions, labels.income, labels.expenses, labels.net],
      rows: report.byPaymentMethod.map((item) => [
        textForLocale(item.name, locale),
        item.count,
        formatFinanceAmount(item.income, currency),
        formatFinanceAmount(item.expenses, currency),
        formatFinanceAmount(item.net, currency),
      ]),
    },
  ];
}
