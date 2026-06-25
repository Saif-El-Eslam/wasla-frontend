'use client';

export function SectionTitle({
  eyebrow,
  icon,
  title,
  children,
}: {
  eyebrow?: string;
  icon?: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-normal text-primary">{eyebrow}</p>
        ) : null}
        <div className="flex items-center gap-2">
          {icon ? <div>{icon}</div> : null}
          <h2 className="text-md font-bold text-stone-950">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}
