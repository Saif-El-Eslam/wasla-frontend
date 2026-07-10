'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, MessageSquareHeart, Send, Star, X } from 'lucide-react';
import type {
  Branch,
  BranchManagement,
  Menu,
  PublicBranch,
  PublicFeedbackListResponse,
  PublicVenue,
  Venue,
} from '@/lib/api';
import { cx } from '@/components/ui/dashboard-ui';
import { publicMenuApi } from '@/features/public/api/public-menu.api';
import { textForLocale } from '@/lib/localized-text';

const reviewsPageSize = 8;

type VenueLike = Venue | PublicVenue;
type BranchLike = Branch | BranchManagement | PublicBranch;
type ReviewMode = 'rate' | 'reviews';

const copy = {
  en: {
    prompt: 'Reviews & feedback',
    rateTab: 'Rate',
    reviewsTab: 'Reviews',
    title: 'How was your experience?',
    body: 'A quick rating helps this branch improve without interrupting your menu browsing.',
    name: 'Name (optional)',
    phone: 'Phone (optional)',
    comment: 'Tell us what happened (optional)',
    submit: 'Send feedback',
    thanksPrivate: 'Thank you. The branch owner will see this privately.',
    thanksPublic: 'Thanks for the love.',
    googleCta: 'Continue to Google Review',
    googleHint: 'Your public review helps more guests discover this branch.',
    close: 'Close',
    saved: 'Saved',
    reviewsTitle: 'Guest reviews',
    reviewsBody: 'Recent public guest love from this branch.',
    loadingReviews: 'Loading reviews...',
    noReviews: 'No public reviews yet.',
    anonymous: 'Guest',
    average: '{rating} average',
    totalReviews: '{count} reviews',
    loadMore: 'Load more',
  },
  ar: {
    prompt: 'التقييمات والملاحظات',
    rateTab: 'قيّم',
    reviewsTab: 'التقييمات',
    title: 'كانت تجربتك عاملة إزاي؟',
    body: 'تقييم سريع يساعد الفرع يتحسن من غير ما يعطلك عن تصفح المنيو.',
    name: 'الاسم (اختياري)',
    phone: 'رقم الهاتف (اختياري)',
    comment: 'اكتب لنا اللي حصل (اختياري)',
    submit: 'إرسال التقييم',
    thanksPrivate: 'شكراً لك. صاحب الفرع سيقرأ الملاحظة بشكل خاص.',
    thanksPublic: 'شكراً على تقييمك الجميل.',
    googleCta: 'المتابعة لتقييم جوجل',
    googleHint: 'تقييمك العام يساعد ضيوف أكثر يكتشفوا الفرع.',
    close: 'إغلاق',
    saved: 'تم الحفظ',
    reviewsTitle: 'تقييمات العملاء',
    reviewsBody: 'أحدث التقييمات العامة لهذا الفرع.',
    loadingReviews: 'جاري تحميل التقييمات...',
    noReviews: 'لا توجد تقييمات عامة بعد.',
    anonymous: 'ضيف',
    average: 'متوسط {rating}',
    totalReviews: '{count} تقييم',
    loadMore: 'تحميل المزيد',
  },
} as const;

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  );
}

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
  const [mode, setMode] = useState<ReviewMode>('rate');
  const [rating, setRating] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [comment, setComment] = useState('');
  const [feedbackId, setFeedbackId] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string | null>(null);
  const [privateIssue, setPrivateIssue] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<PublicFeedbackListResponse | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const branchName = useMemo(() => textForLocale(branch?.name, locale), [branch?.name, locale]);
  const canSubmit = Boolean(branch?.id && rating && !submitting);

  if (!branch?.id) {
    return null;
  }

  const loadReviews = async (page = 1) => {
    if (!branch.id || reviewsLoading) {
      return;
    }

    setReviewsLoading(true);
    try {
      const result = await publicMenuApi.feedback({
        venueId: venue.id,
        branchId: branch.id,
        page,
        limit: reviewsPageSize,
        locale,
      });

      setReviews((current) =>
        page > 1 && current
          ? {
              ...result,
              feedback: [...current.feedback, ...result.feedback],
            }
          : result,
      );
      setReviewsPage(page);
    } finally {
      setReviewsLoading(false);
    }
  };

  const changeMode = (nextMode: ReviewMode) => {
    setMode(nextMode);

    if (nextMode === 'reviews' && !reviews && !reviewsLoading) {
      void loadReviews(1);
    }
  };

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
        guestName: guestName.trim() || undefined,
        guestPhone: guestPhone.trim() || undefined,
        comment: comment.trim() || undefined,
        locale: locale === 'ar' ? 'ar' : 'en',
      });

      const nextGoogleReviewUrl = result.booster.googleReviewUrl;
      const nextPrivateIssue = result.booster.privateIssue;

      setFeedbackId(result.feedback.id);
      setGoogleReviewUrl(nextGoogleReviewUrl);
      setPrivateIssue(nextPrivateIssue);
      setReviews(null);
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
        className="fixed bottom-8 end-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-amber-200 bg-white/95 px-4 text-sm font-black text-stone-900 shadow-2xl shadow-stone-900/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300"
        onClick={() => setOpen(true)}
      >
        <MessageSquareHeart className="size-4 text-amber-500" />
        {labels.prompt}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-stone-950/20 px-3 py-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[calc(100dvh-20vh)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/70 bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-600">
                  {branchName || labels.prompt}
                </p>
                <h2 className="mt-1 text-xl font-black text-stone-950">
                  {mode === 'reviews' ? labels.reviewsTitle : labels.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {mode === 'reviews' ? labels.reviewsBody : labels.body}
                </p>
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

            <div className="mt-4 grid grid-cols-2 rounded-2xl bg-stone-100 p-1">
              {(['rate', 'reviews'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={cx(
                    'h-10 rounded-xl text-sm font-black transition',
                    mode === item ? 'bg-white text-stone-950 shadow-sm' : 'text-muted-foreground',
                  )}
                  onClick={() => changeMode(item)}
                >
                  {item === 'rate' ? labels.rateTab : labels.reviewsTab}
                </button>
              ))}
            </div>

            {mode === 'reviews' ? (
              <div className="mt-4 space-y-3">
                {reviews ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                      {formatTemplate(labels.average, {
                        rating: reviews.summary.averageRating
                          ? reviews.summary.averageRating.toFixed(1)
                          : '0.0',
                      })}
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-600">
                      {formatTemplate(labels.totalReviews, { count: reviews.summary.total })}
                    </span>
                  </div>
                ) : null}

                {reviewsLoading && !reviews ? (
                  <p className="rounded-2xl bg-stone-50 p-4 text-sm font-bold text-muted-foreground">
                    {labels.loadingReviews}
                  </p>
                ) : reviews?.feedback.length ? (
                  <div className="space-y-2">
                    {reviews.feedback.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-stone-100 bg-stone-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-stone-950">
                            {item.guestName || labels.anonymous}
                          </p>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: item.rating }, (_, index) => (
                              <Star key={index} className="size-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        {item.comment ? (
                          <p className="mt-2 text-sm font-semibold leading-6 text-stone-700">
                            {item.comment}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-stone-50 p-4 text-sm font-bold text-muted-foreground">
                    {reviewsLoading ? labels.loadingReviews : labels.noReviews}
                  </p>
                )}

                {reviews?.pagination.hasNextPage ? (
                  <button
                    type="button"
                    className="inline-flex h-10 w-full items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
                    onClick={() => loadReviews(reviewsPage + 1)}
                    disabled={reviewsLoading}
                  >
                    {reviewsLoading ? labels.loadingReviews : labels.loadMore}
                  </button>
                ) : null}
              </div>
            ) : feedbackId ? (
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
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="h-11 rounded-2xl border border-stone-200 bg-stone-50 px-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white"
                    placeholder={labels.name}
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    maxLength={120}
                  />
                  <input
                    className="h-11 rounded-2xl border border-stone-200 bg-stone-50 px-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white"
                    placeholder={labels.phone}
                    value={guestPhone}
                    onChange={(event) => setGuestPhone(event.target.value)}
                    maxLength={40}
                    type="tel"
                  />
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
