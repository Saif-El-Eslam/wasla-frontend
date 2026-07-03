import { compactNumber, percent } from './analytics-utils';

type TooltipPayloadItem = {
  name?: string | number;
  value?: string | number;
  color?: string;
  payload?: Record<string, unknown>;
};

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

export function AnalyticsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const source = payload[0]?.payload ?? {};
  const percentage = numberValue(source.percentage);
  const percentageLabel = typeof source.percentageLabel === 'string' ? source.percentageLabel : 'Rate';

  return (
    <div className="min-w-40 rounded-2xl border border-white/10 bg-stone-950 px-3 py-2 text-white shadow-2xl">
      <p className="text-[10px] font-black uppercase tracking-normal text-white/60">{label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((item) => (
          <p
            key={`${item.name ?? 'value'}`}
            className="flex items-center justify-between gap-5 text-xs font-bold"
          >
            <span className="inline-flex items-center gap-2 text-white/70">
              <span className="size-2 rounded-full" style={{ backgroundColor: item.color ?? '#14b8a6' }} />
              {item.name}
            </span>
            <span className="text-white">{compactNumber(numberValue(item.value))}</span>
          </p>
        ))}
      </div>
      {Number.isFinite(percentage) && percentage > 0 ? (
        <p className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-white/10 px-2 py-1 text-xs font-bold text-white/70">
          <span>{percentageLabel}</span>
          <span className="text-white">{percent(percentage)}</span>
        </p>
      ) : null}
    </div>
  );
}
