'use client';

export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-normal text-primary">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-xl font-bold text-stone-950">{title}</h2>
      </div>
      {children}
    </div>
  );
}
