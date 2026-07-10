'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, MessageSquareHeart, Send, Star, X } from 'lucide-react';
import type { Branch, BranchManagement, Menu, PublicBranch, PublicVenue, Venue } from '@/lib/api';
import { cx } from '@/components/ui/dashboard-ui';
import { publicMenuApi } from '@/features/public/api/public-menu.api';
import { textForLocale } from '@/lib/localized-text';

type VenueLike = Venue | PublicVenue;
type BranchLike = Branch | BranchManagement | PublicBranch;

const copy = {
  en: {
    prompt: 'Rate your experience',
    title: 'How was your experience?',
    body: 'A quick rating helps this branch improve without interrupting your menu browsing.',
    comment: 'Tell us what happened (optional)',
    submit: 'Send feedback',
    thanksPrivate: 'Thank you. The branch owner will see this privately.',
    thanksPublic: 'Thanks for the love.',
    googleCta: 'Continue to Google Review',
    googleHint: 'Your public review helps more guests discover this branch.',
    close: 'Close',
    saved: 'Saved',
  },
  ar: {
    prompt: 'قيّم تجربتك',
    title: 'كانت تجربتك عاملة إزاي؟',
    body: 'تقييم سريع يساعد الفرع يتحسن من غير ما يعطلك عن تصفح المنيو.',
    comment: 'اكتب لنا اللي حصل (اختياري)',
    submit: 'إرسال التقييم',
    thanksPrivate: 'شكراً لك. صاحب الفرع سيقرأ الملاحظة بشكل خاص.',
    thanksPublic: 'شكراً على تقييمك الجميل.',
    googleCta: 'المتابعة لتقييم جوجل',
    googleHint: 'تقييمك العام يساعد ضيوف أكثر يكتشفوا الفرع.',
    close: 'إغلاق',
    saved: 'تم الحفظ',
  },
} as const;

export function PublicReviewBooster({
  venue,
  branch,
  menu,
  locale,
}: {
  venue: VenueLike;
  branch?: BranchLike;
  menu: Menu | null;
  locale: string;
}) {
  const labels = locale === 'ar' ? copy.ar : copy.en;
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackId, setFeedbackId] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string | null>(null);
  const [privateIssue, setPrivateIssue] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const branchName = useMemo(() => textForLocale(branch?.name, locale), [branch?.name, locale]);
  const canSubmit = Boolean(branch?.id && rating && !submitting);

  if (!branch?.id) {
    return null;
  }

  const redirectToGoogleReview = (url: string, id?: string) => {
    if (id) {
      void publicMenuApi.trackGoogleReviewClick(id);
    }

    window.location.assign(url);
  };

  const submit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await publicMenuApi.submitFeedback({
        venueId: venue.id,
        branchId: branch.id,
        menuId: menu?.id,
        rating,
        comment: comment.trim() || undefined,
        locale: locale === 'ar' ? 'ar' : 'en',
      });

      const nextGoogleReviewUrl = result.booster.googleReviewUrl;
      const nextPrivateIssue = result.booster.privateIssue;

      setFeedbackId(result.feedback.id);
      setGoogleReviewUrl(nextGoogleReviewUrl);
      setPrivateIssue(nextPrivateIssue);
    } finally {
      setSubmitting(false);
    }
  };

  const openGoogleReview = () => {
    if (!googleReviewUrl) {
      return;
    }

    redirectToGoogleReview(googleReviewUrl, feedbackId);
  };

  return (
    <>
      <button
        type="button"
        className="fixed bottom-4 end-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-200 bg-white/95 px-4 text-sm font-black text-stone-900 shadow-2xl shadow-stone-900/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300"
        onClick={() => setOpen(true)}
      >
        <MessageSquareHeart className="size-4 text-amber-500" />
        {labels.prompt}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/20 px-3 py-4 backdrop-blur-sm">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/70 bg-white p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-600">
                  {branchName || labels.prompt}
                </p>
                <h2 className="mt-1 text-xl font-black text-stone-950">{labels.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{labels.body}</p>
              </div>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
              >
                <X className="size-4" />
              </button>
            </div>

            {feedbackId ? (
              <div className="mt-4 rounded-3xl bg-[#f8fafa] p-4">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rating }, (_, index) => (
                    <Star key={index} className="size-5 fill-current" />
                  ))}
                </div>
                <h3 className="mt-3 text-lg font-black text-stone-950">
                  {privateIssue ? labels.thanksPrivate : labels.thanksPublic}
                </h3>
                {googleReviewUrl ? (
                  <>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{labels.googleHint}</p>
                    <button
                      type="button"
                      className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 text-sm font-black text-white transition hover:bg-stone-800"
                      onClick={openGoogleReview}
                    >
                      <ExternalLink className="size-4" />
                      {labels.googleCta}
                    </button>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={cx(
                        'flex aspect-square items-center justify-center rounded-2xl border text-amber-500 transition',
                        rating >= value
                          ? 'border-amber-300 bg-amber-50 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-amber-200',
                      )}
                      onClick={() => setRating(value)}
                      aria-label={`${value} star`}
                    >
                      <Star className={cx('size-6', rating >= value ? 'fill-current' : '')} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="min-h-24 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white"
                  placeholder={labels.comment}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  maxLength={1000}
                />
                <button
                  type="button"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={submit}
                  disabled={!canSubmit}
                >
                  <Send className="size-4" />
                  {submitting ? labels.saved : labels.submit}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
