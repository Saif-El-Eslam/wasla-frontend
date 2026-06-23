'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, CheckCircle2, ImageIcon, Plus, ToggleLeft, ToggleRight, UtensilsCrossed, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api } from '@/api';
import { Badge, BranchSelect, Card, EmptyState, FormPanel, IconButton, PrimaryButton, SectionTitle, TabLoader, cx, itemPriceText, type PriceDraft } from '@/components/dashboard/dashboard-ui';
import { readError, toLocalized, type LocalizedDraft } from '@/components/dashboard/dashboard-utils';
import { useBranchMenu, useBranchOptions } from '@/hooks/use-venue';
import { queryKeys } from '@/lib/query-keys';
import { textForLocale } from '@/lib/localized-text';

export function MenuTab({
  initialBranchId,
  locale,
  currency,
}: {
  initialBranchId: string;
  locale: string;
  currency: string;
}) {
  const t = useTranslations('dashboard');
  const commonT = useTranslations('common');
  const queryClient = useQueryClient();
  const branchOptions = useBranchOptions();
  const branches = branchOptions.data?.branches ?? [];
  const defaultBranchId = branches.find((item) => item.active)?.id ?? branches[0]?.id ?? '';
  const selectedBranchId = branches.some((item) => item.id === initialBranchId) ? initialBranchId : defaultBranchId;
  const [localBranchId, setLocalBranchId] = useState('');
  const effectiveBranchId = branches.some((item) => item.id === localBranchId) ? localBranchId : selectedBranchId;
  const menuQuery = useBranchMenu(effectiveBranchId);
  const branch = branches.find((item) => item.id === effectiveBranchId);
  const menu = menuQuery.data ?? null;
  const [formMode, setFormMode] = useState<'menu' | 'category' | 'item' | null>(null);
  const [menuName, setMenuName] = useState<LocalizedDraft>({ en: '', ar: '' });
  const [categoryName, setCategoryName] = useState<LocalizedDraft>({ en: '', ar: '' });
  const [categoryDescription, setCategoryDescription] = useState<LocalizedDraft>({ en: '', ar: '' });
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [categoryActive, setCategoryActive] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [itemName, setItemName] = useState<LocalizedDraft>({ en: '', ar: '' });
  const [itemDescription, setItemDescription] = useState<LocalizedDraft>({ en: '', ar: '' });
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemTags, setItemTags] = useState('');
  const [itemCalories, setItemCalories] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);
  const [singlePrice, setSinglePrice] = useState('');
  const [multiPriceMode, setMultiPriceMode] = useState(false);
  const [prices, setPrices] = useState<PriceDraft[]>([{ label: t('regular'), price: '' }]);
  const effectiveCategoryId = menu?.categories.some((category) => category.id === selectedCategoryId)
    ? selectedCategoryId
    : (menu?.categories[0]?.id ?? '');

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.branches });
    if (effectiveBranchId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.branch(effectiveBranchId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.branchMenu(effectiveBranchId) });
    }
  };

  const createMenuMutation = useMutation({
    mutationFn: () =>
      api.createBranchMenu(effectiveBranchId, {
        name: toLocalized(menuName, `${textForLocale(branch?.name, locale)} ${t('menu')}`),
        theme: 'MODERN',
        showPrices: true,
      }),
    onSuccess: () => {
      setMenuName({ en: '', ar: '' });
      setFormMode(null);
      invalidate();
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => (menu?.publishedAt ? api.unpublishBranchMenu(effectiveBranchId) : api.publishBranchMenu(effectiveBranchId)),
    onSuccess: invalidate,
  });

  const createCategoryMutation = useMutation({
    mutationFn: () =>
      api.createCategory(effectiveBranchId, {
        name: toLocalized(categoryName, t('addCategory')),
        description: categoryDescription.en || categoryDescription.ar ? toLocalized(categoryDescription, '') : undefined,
        imageUrl: categoryImageUrl || undefined,
        active: categoryActive,
      }),
    onSuccess: () => {
      setCategoryName({ en: '', ar: '' });
      setCategoryDescription({ en: '', ar: '' });
      setCategoryImageUrl('');
      setCategoryActive(true);
      setFormMode(null);
      invalidate();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, active }: { categoryId: string; active: boolean }) => api.updateCategory(effectiveBranchId, categoryId, { active }),
    onSuccess: invalidate,
  });

  const pricePayload = multiPriceMode
    ? prices
        .filter((price) => price.label.trim() && price.price.trim())
        .slice(0, 5)
        .map((price, sortOrder) => ({ label: price.label.trim(), price: Number(price.price), sortOrder }))
    : singlePrice
      ? [{ label: t('regular'), price: Number(singlePrice), sortOrder: 0 }]
      : [];

  const canCreateItem = Boolean((itemName.en.trim() || itemName.ar.trim()) && effectiveCategoryId && pricePayload.length >= 1 && pricePayload.length <= 5);

  useEffect(() => {
    if (initialBranchId) {
      setLocalBranchId(initialBranchId);
    }
  }, [initialBranchId]);

  const createItemMutation = useMutation({
    mutationFn: () =>
      api.createItem(effectiveBranchId, effectiveCategoryId, {
        name: toLocalized(itemName, t('addItem')),
        description: itemDescription.en || itemDescription.ar ? toLocalized(itemDescription, '') : undefined,
        imageUrl: itemImageUrl || undefined,
        prices: pricePayload,
        available: itemAvailable,
        tags: itemTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        calories: itemCalories ? Number(itemCalories) : undefined,
      }),
    onSuccess: () => {
      setItemName({ en: '', ar: '' });
      setItemDescription({ en: '', ar: '' });
      setItemImageUrl('');
      setItemTags('');
      setItemCalories('');
      setItemAvailable(true);
      setSinglePrice('');
      setPrices([{ label: t('regular'), price: '' }]);
      setFormMode(null);
      invalidate();
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({ categoryId, itemId, available }: { categoryId: string; itemId: string; available: boolean }) =>
      api.toggleItemAvailability(effectiveBranchId, categoryId, itemId, available),
    onSuccess: invalidate,
  });

  if (branchOptions.isLoading) {
    return <TabLoader label={t('loadingWorkspace')} />;
  }

  if (branches.length === 0) {
    return <EmptyState icon={Building2} title={t('createBranchFirst')} body={t('menuNeedsBranch')} />;
  }

  return (
    <div className="space-y-5">
      <SectionTitle eyebrow={t('branchRequired')} title={t('menuEditor')}>
        <BranchSelect branches={branches} value={effectiveBranchId} onChange={setLocalBranchId} locale={locale} />
      </SectionTitle>

      {menuQuery.isLoading ? (
        <TabLoader label={t('loadingWorkspace')} />
      ) : !menu ? (
        <Card>
          <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="amber">{t('noMenu')}</Badge>
                <p className="text-sm font-bold text-stone-900">{branch ? textForLocale(branch.name, locale) : t('selectedBranch')}</p>
              </div>
              <h3 className="mt-3 text-xl font-black text-stone-950">{t('branchHasNoMenu')}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('createMenuBeforeContent')}</p>
            </div>
            <div className="grid gap-2">
              <PrimaryButton onClick={() => setFormMode('menu')} disabled={createMenuMutation.isPending}>
                <Plus className="size-4" />
                {t('addMenu')}
              </PrimaryButton>
              {createMenuMutation.error ? <p className="text-sm text-red-700">{readError(createMenuMutation.error)}</p> : null}
            </div>
          </div>
          {formMode === 'menu' ? (
            <div className="mt-4">
              <FormPanel title={t('createMenu')} closeLabel={commonT('close')} onClose={() => setFormMode(null)}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={menuName.en} onChange={(event) => setMenuName((current) => ({ ...current, en: event.target.value }))} placeholder={t('menuNameInEnglish')} />
                  <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={menuName.ar} onChange={(event) => setMenuName((current) => ({ ...current, ar: event.target.value }))} placeholder={t('menuNameInArabic')} dir="rtl" />
                </div>
                <div className="mt-4">
                  <PrimaryButton onClick={() => createMenuMutation.mutate()} disabled={(!menuName.en.trim() && !menuName.ar.trim()) || createMenuMutation.isPending}>
                    <CheckCircle2 className="size-4" />
                    {t('createMenu')}
                  </PrimaryButton>
                </div>
              </FormPanel>
            </div>
          ) : null}
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={menu.publishedAt ? 'green' : 'muted'}>{menu.publishedAt ? t('published') : t('draft')}</Badge>
                  <Badge tone="teal">{t('categories', { count: menu.categories.length })}</Badge>
                </div>
                <h3 className="mt-2 text-2xl font-black text-stone-950">{textForLocale(menu.name, locale)}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('itemsInBranch', {
                    items: menu.categories.reduce((sum, category) => sum + category.items.length, 0),
                    branch: branch ? textForLocale(branch.name, locale) : t('selectedBranch'),
                  })}
                </p>
              </div>
              <PrimaryButton onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
                <CheckCircle2 className="size-4" />
                {menu.publishedAt ? t('unpublish') : t('publish')}
              </PrimaryButton>
            </div>
          </Card>

          <div className="space-y-3">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <SectionTitle eyebrow={t('build')} title={t('categoriesAndItemsTitle')} />
                <IconButton label={t('addCategory')} onClick={() => setFormMode('category')} disabled={createCategoryMutation.isPending}>
                  <Plus className="size-4" />
                </IconButton>
              </div>

              {formMode === 'category' ? (
                <FormPanel title={t('addCategory')} closeLabel={commonT('close')} onClose={() => setFormMode(null)}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={categoryName.en} onChange={(event) => setCategoryName((current) => ({ ...current, en: event.target.value }))} placeholder={t('categoryNameInEnglish')} />
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={categoryName.ar} onChange={(event) => setCategoryName((current) => ({ ...current, ar: event.target.value }))} placeholder={t('categoryNameInArabic')} dir="rtl" />
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={categoryDescription.en} onChange={(event) => setCategoryDescription((current) => ({ ...current, en: event.target.value }))} placeholder={t('descriptionInEnglish')} />
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={categoryDescription.ar} onChange={(event) => setCategoryDescription((current) => ({ ...current, ar: event.target.value }))} placeholder={t('descriptionInArabic')} dir="rtl" />
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary sm:col-span-2" value={categoryImageUrl} onChange={(event) => setCategoryImageUrl(event.target.value)} placeholder={t('categoryImageUrl')} />
                      <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold">
                        <input type="checkbox" checked={categoryActive} onChange={(event) => setCategoryActive(event.target.checked)} />
                        {t('activeCategory')}
                      </label>
                    </div>
                    <div className="mt-4">
                      <PrimaryButton onClick={() => createCategoryMutation.mutate()} disabled={(!categoryName.en.trim() && !categoryName.ar.trim()) || createCategoryMutation.isPending}>
                        <CheckCircle2 className="size-4" />
                        {t('createCategory')}
                      </PrimaryButton>
                    </div>
                    {createCategoryMutation.error ? <p className="mt-2 text-sm text-red-700">{readError(createCategoryMutation.error)}</p> : null}
                  </FormPanel>
              ) : null}

              {formMode === 'item' ? (
                <FormPanel title={t('addItem')} closeLabel={commonT('close')} onClose={() => setFormMode(null)}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary sm:col-span-2" value={effectiveCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
                        {menu.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {textForLocale(category.name, locale)}
                          </option>
                        ))}
                      </select>
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={itemName.en} onChange={(event) => setItemName((current) => ({ ...current, en: event.target.value }))} placeholder={t('itemNameInEnglish')} />
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={itemName.ar} onChange={(event) => setItemName((current) => ({ ...current, ar: event.target.value }))} placeholder={t('itemNameInArabic')} dir="rtl" />
                      <textarea className="min-h-20 rounded-xl border border-border px-3 py-2 outline-none focus:border-primary" value={itemDescription.en} onChange={(event) => setItemDescription((current) => ({ ...current, en: event.target.value }))} placeholder={t('descriptionInEnglish')} />
                      <textarea className="min-h-20 rounded-xl border border-border px-3 py-2 outline-none focus:border-primary" value={itemDescription.ar} onChange={(event) => setItemDescription((current) => ({ ...current, ar: event.target.value }))} placeholder={t('descriptionInArabic')} dir="rtl" />
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary sm:col-span-2" value={itemImageUrl} onChange={(event) => setItemImageUrl(event.target.value)} placeholder={t('imageUrl')} />
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={itemTags} onChange={(event) => setItemTags(event.target.value)} placeholder={t('tagsSeparated')} />
                      <input className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary" value={itemCalories} onChange={(event) => setItemCalories(event.target.value)} placeholder={t('calories')} inputMode="numeric" />
                      <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold">
                        <input type="checkbox" checked={itemAvailable} onChange={(event) => setItemAvailable(event.target.checked)} />
                        {t('available')}
                      </label>
                    </div>
                    <div className="mt-3 rounded-xl border border-border bg-stone-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-stone-900">{t('multiLabeledPrices')}</p>
                          <p className="text-xs text-muted-foreground">{t('multiLabeledPricesBody')}</p>
                        </div>
                        <button className={cx('relative h-7 w-12 rounded-full transition', multiPriceMode ? 'bg-primary' : 'bg-stone-300')} onClick={() => setMultiPriceMode((current) => !current)} type="button">
                          <span className={cx('absolute top-1 size-5 rounded-full bg-white shadow transition', multiPriceMode ? 'left-6' : 'left-1')} />
                        </button>
                      </div>

                      {!multiPriceMode ? (
                        <input className="mt-3 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary" value={singlePrice} onChange={(event) => setSinglePrice(event.target.value)} placeholder={t('regularPrice')} inputMode="decimal" />
                      ) : (
                        <div className="mt-3 space-y-2">
                          {prices.map((price, index) => (
                            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                              <input className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary" value={price.label} onChange={(event) => setPrices((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, label: event.target.value } : item)))} placeholder={t('label')} />
                              <input className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary" value={price.price} onChange={(event) => setPrices((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, price: event.target.value } : item)))} placeholder={t('price')} inputMode="decimal" />
                              <IconButton label={t('removePrice')} onClick={() => setPrices((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={prices.length === 1}>
                                <X className="size-4" />
                              </IconButton>
                            </div>
                          ))}
                          <button className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-bold text-stone-700 transition hover:border-primary hover:text-primary disabled:opacity-50" onClick={() => setPrices((current) => [...current, { label: '', price: '' }])} disabled={prices.length >= 5} type="button">
                            {t('addPriceOption')}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <PrimaryButton onClick={() => createItemMutation.mutate()} disabled={!canCreateItem || createItemMutation.isPending}>
                        <CheckCircle2 className="size-4" />
                        {t('createItem')}
                      </PrimaryButton>
                    </div>
                    {createItemMutation.error ? <p className="mt-2 text-sm text-red-700">{readError(createItemMutation.error)}</p> : null}
                  </FormPanel>
              ) : null}
            </Card>

            {menu.categories.length > 0 ? (
              menu.categories.map((category) => (
                <Card key={category.id}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-stone-950">{textForLocale(category.name, locale)}</h3>
                        <Badge tone={category.active ? 'green' : 'muted'}>{category.active ? t('active') : t('hidden')}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('itemCount', { count: category.items.length })}</p>
                    </div>
                    <button
                      className={cx('relative h-7 w-12 rounded-full transition disabled:opacity-50', category.active ? 'bg-primary' : 'bg-stone-300')}
                      onClick={() => updateCategoryMutation.mutate({ categoryId: category.id, active: !category.active })}
                      disabled={updateCategoryMutation.isPending}
                      aria-label={category.active ? t('deactivateCategory') : t('activateCategory')}
                    >
                      <span className={cx('absolute top-1 size-5 rounded-full bg-white shadow transition', category.active ? 'left-6' : 'left-1')} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {category.items.length > 0 ? (
                      category.items.map((item) => (
                        <div key={item.id} className="grid gap-3 rounded-2xl border border-border bg-stone-50 p-3 sm:grid-cols-[64px_1fr_auto] sm:items-center">
                          <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-white">
                            {item.imageUrl ? <img src={item.imageUrl} alt="" className="size-full object-cover" /> : <ImageIcon className="size-5 text-stone-300" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-stone-900">{textForLocale(item.name, locale)}</p>
                              {item.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} tone="teal">{tag}</Badge>
                              ))}
                            </div>
                            <p className="mt-1 truncate text-xs text-muted-foreground">{textForLocale(item.description, locale) || t('noDescription')}</p>
                            <p className="mt-1 text-xs font-bold text-primary">{itemPriceText(item, currency, t('noPrice'))}</p>
                          </div>
                          <button
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 text-xs font-bold text-stone-700 transition hover:border-primary hover:text-primary"
                            onClick={() => toggleItemMutation.mutate({ categoryId: category.id, itemId: item.id, available: !item.available })}
                            disabled={toggleItemMutation.isPending}
                          >
                            {item.available ? <ToggleRight className="size-4 text-primary" /> : <ToggleLeft className="size-4" />}
                            {item.available ? t('available') : t('hidden')}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl bg-stone-50 p-3 text-sm text-muted-foreground">{t('noItemsInCategory')}</p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState icon={UtensilsCrossed} title={t('addFirstCategory')} body={t('categoryNeeded')} />
            )}

            <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-stone-950">{t('addMenuItem')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('itemsCreatedUnderCategory')}</p>
              </div>
              <PrimaryButton onClick={() => setFormMode('item')} disabled={menu.categories.length === 0}>
                <Plus className="size-4" />
                {t('addItem')}
              </PrimaryButton>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

