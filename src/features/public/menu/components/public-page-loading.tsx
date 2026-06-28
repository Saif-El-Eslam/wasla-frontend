import { MapPin, MessageCircle, Phone, QrCode } from 'lucide-react';

export function PublicPageLoading() {
  return (
    <main className="wasla-public-loader relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#042f2e] px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(45,212,191,0.24),transparent_30%),radial-gradient(circle_at_84%_76%,rgba(251,191,36,0.2),transparent_28%)]" />
      <div className="relative grid w-full max-w-4xl items-center gap-8 sm:grid-cols-[0.85fr_1fr]">
        <div className="text-center sm:text-start">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-teal-500 text-xl font-black text-white shadow-2xl shadow-teal-950/30 sm:mx-0">
            W
          </div>
          <div className="wasla-loader-copy h-4 w-40 rounded-full bg-white/20 sm:w-52" />
          <div className="wasla-loader-copy mt-3 h-8 w-full max-w-xs rounded-full bg-white/15 sm:max-w-sm" />
          <div className="wasla-loader-copy mt-3 h-8 w-4/5 max-w-xs rounded-full bg-white/10 sm:max-w-sm" />
        </div>

        <div className="wasla-loader-stage relative mx-auto h-80 w-full max-w-sm">
          <div className="wasla-loader-phone absolute left-1/2 top-1/2 h-72 w-52 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-white/20 bg-stone-950 p-3 shadow-2xl">
            <div className="h-full overflow-hidden rounded-[1.45rem] bg-[#f8fafa] p-3">
              <div className="h-20 rounded-2xl bg-[linear-gradient(135deg,#0f766e,#fbbf24)]" />
              <div className="mt-3 flex gap-2">
                <div className="h-6 w-16 rounded-full bg-teal-100" />
                <div className="h-6 w-14 rounded-full bg-amber-100" />
                <div className="h-6 w-14 rounded-full bg-stone-100" />
              </div>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className={`wasla-loader-menu-line wasla-loader-menu-line-${item + 1} mt-3 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-2`}
                >
                  <div className="size-10 rounded-xl bg-teal-100" />
                  <div className="flex-1">
                    <div className="h-3 w-24 rounded-full bg-stone-900" />
                    <div className="mt-2 h-2 w-16 rounded-full bg-stone-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="wasla-loader-qr absolute start-0 top-4 rounded-2xl bg-white p-3 text-stone-950 shadow-2xl">
            <QrCode className="size-16" />
            <span className="wasla-loader-scan absolute inset-x-3 h-1 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
          </div>

          <div className="wasla-loader-chip wasla-loader-chip-1 absolute end-0 top-14 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-stone-900 shadow-xl">
            <MessageCircle className="size-4 text-teal-600" />
          </div>
          <div className="wasla-loader-chip wasla-loader-chip-2 absolute bottom-16 start-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-stone-900 shadow-xl">
            <MapPin className="size-4 text-teal-600" />
          </div>
          <div className="wasla-loader-chip wasla-loader-chip-3 absolute bottom-4 end-8 inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-2 text-xs font-black text-stone-950 shadow-xl">
            <Phone className="size-4" />
          </div>
        </div>
      </div>
    </main>
  );
}
