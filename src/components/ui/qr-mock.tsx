'use client';

import { cx } from './cx';
import { LogoMark } from './logo-mark';

export function QRMock() {
  const cells = Array.from({ length: 100 }, (_, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const inCorner = (row < 3 && col < 3) || (row < 3 && col > 6) || (row > 6 && col < 3);
    return !inCorner && (i * 13 + row * 7 + col * 3) % 17 < 9;
  });

  return (
    <div className="relative size-72 bg-white p-4">
      <div className="absolute left-4 top-4 size-14 rounded-sm border-4 border-stone-950 p-1">
        <div className="size-full rounded-[2px] bg-stone-950" />
      </div>
      <div className="absolute right-4 top-4 size-14 rounded-sm border-4 border-stone-950 p-1">
        <div className="size-full rounded-[2px] bg-stone-950" />
      </div>
      <div className="absolute bottom-4 left-4 size-14 rounded-sm border-4 border-stone-950 p-1">
        <div className="size-full rounded-[2px] bg-stone-950" />
      </div>
      <div className="absolute inset-[76px] grid grid-cols-10 gap-px">
        {cells.map((on, index) => (
          <span key={index} className={cx('rounded-[1px]', on ? 'bg-stone-950' : 'bg-transparent')} />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <LogoMark className="flex size-12 items-center justify-center text-lg font-black text-white shadow-lg" />
      </div>
    </div>
  );
}
