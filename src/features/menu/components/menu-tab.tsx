'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CheckCircle2,
  Edit3,
  ImageIcon,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, type MenuCategory, type MenuItem } from '@/lib/api';
import {
  Badge,
  BranchSelect,
  Card,
  EmptyState,
  FormPanel,
  IconButton,
  PrimaryButton,
  SectionTitle,
  TabLoader,
  cx,
  itemPriceText,
} from '@/components/ui/dashboard-ui';
import { readError, toLocalized, type LocalizedDraft } from '@/features/dashboard/utils/dashboard-utils';
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { FormTextarea } from '@/components/ui/form-textarea';
import { useBranchMenu, useBranchOptions } from '@/features/venue/hooks/use-venue';
import {
  addCachedCategory,
  addCachedItem,
  removeCachedCategory,
  removeCachedItem,
  replaceCachedCategory,
  replaceCachedMenu,
  replaceCachedItem,
  setCachedMenuPublishedAt,
} from '@/features/menu/cache/menu-cache';
import { textForLocale } from '@/lib/localized-text';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  categoryFormSchema,
  itemFormSchema,
  menuFormSchema,
  type CategoryFormInput,
  type CategoryFormValues,
  type ItemFormInput,
  type ItemFormValues,
  type MenuFormInput,
  type MenuFormValues,
} from '@/features/menu/schemas/menu.schema';

const emptyLocalizedDraft: LocalizedDraft = { en: '', ar: '' };

function draftWithFallback(value?: Partial<LocalizedDraft>): LocalizedDraft {
  return { en: value?.en ?? '', ar: value?.ar ?? '' };
}

function draftFromLocalized(
  value: MenuCategory['name'] | MenuItem['name'] | MenuCategory['description'] | MenuItem['description'],
  locale: string,
): LocalizedDraft {
  if (!value) {
    return draftWithFallback();
  }

  if (typeof value === 'string') {
    return { en: locale === 'en' ? value : '', ar: locale === 'ar' ? value : '' };
  }

  return { en: value.en ?? '', ar: value.ar ?? '' };
}

function priceToText(value: string | number | null | undefined) {
  return value === null || value === undefined ? '' : String(value);
}

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
  const selectedBranchId = branches.some((item) => item.id === initialBranchId)
    ? initialBranchId
    : defaultBranchId;
  const [localBranchId, setLocalBranchId] = useState('');
  const effectiveBranchId = branches.some((item) => item.id === localBranchId)
    ? localBranchId
    : selectedBranchId;
  const menuQuery = useBranchMenu(effectiveBranchId);
  const branch = branches.find((item) => item.id === effectiveBranchId);
  const menu = menuQuery.data ?? null;
  const [formMode, setFormMode] = useState<'menu' | 'category' | 'item' | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemContext, setEditingItemContext] = useState<{ categoryId: string; itemId: string } | null>(
    null,
  );
  const menuForm = useForm<MenuFormInput, unknown, MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: { name: emptyLocalizedDraft },
  });
  const categoryForm = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: emptyLocalizedDraft,
      description: emptyLocalizedDraft,
      imageUrl: '',
      active: true,
    },
  });
  const itemForm = useForm<ItemFormInput, unknown, ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      categoryId: '',
      name: emptyLocalizedDraft,
      description: emptyLocalizedDraft,
      imageUrl: '',
      tags: '',
      calories: '',
      available: true,
      priceMode: 'single',
      singlePrice: '',
      prices: [{ label: t('regular'), price: '' }],
    },
  });
  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({
    control: itemForm.control,
    name: 'prices',
  });
  const watchedPriceMode = itemForm.watch('priceMode');
  const effectiveCategoryId = menu?.categories.some(
    (category) => category.id === itemForm.watch('categoryId'),
  )
    ? itemForm.watch('categoryId')
    : (menu?.categories[0]?.id ?? '');

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    categoryForm.reset({
      name: draftWithFallback(),
      description: draftWithFallback(),
      imageUrl: '',
      active: true,
    });
  };

  const resetItemForm = () => {
    setEditingItemContext(null);
    itemForm.reset({
      categoryId: effectiveCategoryId,
      name: draftWithFallback(),
      description: draftWithFallback(),
      imageUrl: '',
      tags: '',
      calories: '',
      available: true,
      priceMode: 'single',
      singlePrice: '',
      prices: [{ label: t('regular'), price: '' }],
    });
  };

  const closeForm = () => {
    setFormMode(null);
    resetCategoryForm();
    resetItemForm();
  };

  const openCreateCategoryForm = () => {
    resetCategoryForm();
    setFormMode('category');
  };

  const openEditCategoryForm = (category: MenuCategory) => {
    setEditingCategoryId(category.id);
    categoryForm.reset({
      name: draftFromLocalized(category.name, locale),
      description: draftFromLocalized(category.description, locale),
      imageUrl: category.imageUrl ?? '',
      active: category.active,
    });
    setFormMode('category');
  };

  const openCreateItemForm = () => {
    resetItemForm();
    setFormMode('item');
  };

  const openEditItemForm = (category: MenuCategory, item: MenuItem) => {
    const itemPrices =
      item.prices.length > 0
        ? item.prices.map((price) => ({ label: price.label, price: priceToText(price.price) }))
        : [{ label: t('regular'), price: priceToText(item.price) }];
    const useMultiPrices = itemPrices.length > 1;

    setEditingItemContext({ categoryId: category.id, itemId: item.id });
    itemForm.reset({
      categoryId: category.id,
      name: draftFromLocalized(item.name, locale),
      description: draftFromLocalized(item.description, locale),
      imageUrl: item.imageUrl ?? '',
      tags: item.tags.join(', '),
      calories: item.calories ?? '',
      available: item.available,
      priceMode: useMultiPrices ? 'multi' : 'single',
      singlePrice: useMultiPrices ? '' : (itemPrices[0]?.price ?? ''),
      prices: itemPrices.length > 0 ? itemPrices : [{ label: t('regular'), price: '' }],
    });
    setFormMode('item');
  };

  const createMenuMutation = useMutation({
    mutationFn: (values: MenuFormValues) =>
      api.createBranchMenu(effectiveBranchId, {
        name: toLocalized(values.name, `${textForLocale(branch?.name, locale)} ${t('menu')}`),
        theme: 'MODERN',
        showPrices: true,
      }),
    onSuccess: ({ menu: createdMenu }, values) => {
      replaceCachedMenu(queryClient, effectiveBranchId, {
        ...createdMenu,
        name: toLocalized(values.name, `${textForLocale(branch?.name, locale)} ${t('menu')}`),
      });
      menuForm.reset({ name: draftWithFallback() });
      setFormMode(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      menu?.publishedAt
        ? api.unpublishBranchMenu(effectiveBranchId)
        : api.publishBranchMenu(effectiveBranchId),
    onSuccess: ({ menu: updatedMenu }) => {
      setCachedMenuPublishedAt(queryClient, effectiveBranchId, updatedMenu.publishedAt);
    },
  });

  const categoryPayload = (values: CategoryFormValues) => {
    const description = draftWithFallback(values.description);

    return {
      name: toLocalized(values.name, t('addCategory')),
      description: description.en || description.ar ? toLocalized(description, '') : undefined,
      imageUrl: values.imageUrl || undefined,
      active: values.active,
    };
  };

  const categoryCachePatch = (values: CategoryFormValues): Partial<MenuCategory> => {
    const payload = categoryPayload(values);

    return {
      ...payload,
      description: payload.description ?? null,
      imageUrl: payload.imageUrl ?? null,
    };
  };

  const createCategoryMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      api.createCategory(effectiveBranchId, categoryPayload(values)),
    onSuccess: ({ category }, values) => {
      const patch = categoryCachePatch(values);
      addCachedCategory(queryClient, effectiveBranchId, { ...category, ...patch, items: category.items ?? [] });
      resetCategoryForm();
      setFormMode(null);
    },
  });

  const saveCategoryMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      if (!editingCategoryId) {
        throw new Error('No category selected');
      }

      return api.updateCategory(effectiveBranchId, editingCategoryId, categoryPayload(values));
    },
    onSuccess: ({ category }, values) => {
      if (editingCategoryId) {
        replaceCachedCategory(queryClient, effectiveBranchId, editingCategoryId, {
          ...category,
          ...categoryCachePatch(values),
        });
      }
      resetCategoryForm();
      setFormMode(null);
    },
  });

  const toggleCategoryMutation = useMutation({
    mutationFn: ({ categoryId, active }: { categoryId: string; active: boolean }) =>
      api.updateCategory(effectiveBranchId, categoryId, { active }),
    onSuccess: ({ category }, variables) => {
      replaceCachedCategory(queryClient, effectiveBranchId, variables.categoryId, { active: category.active });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => api.deleteCategory(effectiveBranchId, categoryId),
    onSuccess: (_result, categoryId) => {
      removeCachedCategory(queryClient, effectiveBranchId, categoryId);
      closeForm();
    },
  });

  useEffect(() => {
    if (initialBranchId) {
      setLocalBranchId(initialBranchId);
    }
  }, [initialBranchId]);

  useEffect(() => {
    if (effectiveCategoryId && itemForm.getValues('categoryId') !== effectiveCategoryId) {
      itemForm.setValue('categoryId', effectiveCategoryId);
    }
  }, [effectiveCategoryId, itemForm]);

  const itemPayload = (values: ItemFormValues) => {
    const description = draftWithFallback(values.description);
    const pricePayload =
      values.priceMode === 'multi'
        ? values.prices
            .filter((price) => price.label.trim() && price.price.trim())
            .slice(0, 5)
            .map((price, sortOrder) => ({ label: price.label.trim(), price: Number(price.price), sortOrder }))
        : values.singlePrice !== undefined
          ? [{ label: t('regular'), price: Number(values.singlePrice), sortOrder: 0 }]
          : [];

    return {
      name: toLocalized(values.name, t('addItem')),
      description: description.en || description.ar ? toLocalized(description, '') : undefined,
      imageUrl: values.imageUrl || undefined,
      prices: pricePayload,
      available: values.available,
      tags: (values.tags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      calories: values.calories,
      };
  };

  const itemCachePatch = (values: ItemFormValues): Partial<MenuItem> => {
    const payload = itemPayload(values);

    return {
      name: payload.name,
      description: payload.description ?? null,
      imageUrl: payload.imageUrl ?? null,
      tags: payload.tags ?? [],
      calories: payload.calories ?? null,
      available: payload.available ?? true,
    };
  };

  const createItemMutation = useMutation({
    mutationFn: (values: ItemFormValues) =>
      api.createItem(effectiveBranchId, values.categoryId, itemPayload(values)),
    onSuccess: ({ item }, values) => {
      const patch = itemCachePatch(values);
      addCachedItem(queryClient, effectiveBranchId, values.categoryId, { ...item, ...patch });
      resetItemForm();
      setFormMode(null);
    },
  });

  const saveItemMutation = useMutation({
    mutationFn: (values: ItemFormValues) => {
      if (!editingItemContext) {
        throw new Error('No item selected');
      }

      return api.updateItem(
        effectiveBranchId,
        editingItemContext.categoryId,
        editingItemContext.itemId,
        itemPayload(values),
      );
    },
    onSuccess: ({ item }, values) => {
      if (editingItemContext) {
        replaceCachedItem(queryClient, effectiveBranchId, editingItemContext.categoryId, editingItemContext.itemId, {
          ...item,
          ...itemCachePatch(values),
        });
      }
      resetItemForm();
      setFormMode(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: ({ categoryId, itemId }: { categoryId: string; itemId: string }) =>
      api.deleteItem(effectiveBranchId, categoryId, itemId),
    onSuccess: (_result, variables) => {
      removeCachedItem(queryClient, effectiveBranchId, variables.categoryId, variables.itemId);
      closeForm();
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: ({
      categoryId,
      itemId,
      available,
    }: {
      categoryId: string;
      itemId: string;
      available: boolean;
    }) => api.toggleItemAvailability(effectiveBranchId, categoryId, itemId, available),
    onSuccess: ({ item }, variables) => {
      replaceCachedItem(queryClient, effectiveBranchId, variables.categoryId, variables.itemId, {
        available: item.available,
      });
    },
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
        <BranchSelect
          branches={branches}
          value={effectiveBranchId}
          onChange={setLocalBranchId}
          locale={locale}
        />
      </SectionTitle>

      {menuQuery.isLoading ? (
        <TabLoader label={t('loadingWorkspace')} />
      ) : !menu ? (
        <Card>
          <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="amber">{t('noMenu')}</Badge>
                <p className="text-sm font-bold text-stone-900">
                  {branch ? textForLocale(branch.name, locale) : t('selectedBranch')}
                </p>
              </div>
              <h3 className="mt-3 text-xl font-black text-stone-950">{t('branchHasNoMenu')}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('createMenuBeforeContent')}</p>
            </div>
            <div className="grid gap-2">
              <PrimaryButton onClick={() => setFormMode('menu')} disabled={createMenuMutation.isPending}>
                <Plus className="size-4" />
                {t('addMenu')}
              </PrimaryButton>
              {createMenuMutation.error ? (
                <p className="text-sm text-red-700">{readError(createMenuMutation.error)}</p>
              ) : null}
            </div>
          </div>
          {formMode === 'menu' ? (
            <div className="mt-4">
              <FormPanel
                title={t('createMenu')}
                closeLabel={commonT('close')}
                onClose={() => setFormMode(null)}
              >
                <form onSubmit={menuForm.handleSubmit((values) => createMenuMutation.mutate(values))}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormInput
                      name="name.en"
                      register={menuForm.register}
                      errors={menuForm.formState.errors}
                      placeholder={t('menuNameInEnglish')}
                    />
                    <FormInput
                      name="name.ar"
                      register={menuForm.register}
                      errors={menuForm.formState.errors}
                      placeholder={t('menuNameInArabic')}
                    />
                  </div>
                  <div className="mt-4">
                    <PrimaryButton type="submit" disabled={createMenuMutation.isPending}>
                      <CheckCircle2 className="size-4" />
                      {t('createMenu')}
                    </PrimaryButton>
                  </div>
                </form>
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
                  <Badge tone={menu.publishedAt ? 'green' : 'muted'}>
                    {menu.publishedAt ? t('published') : t('draft')}
                  </Badge>
                  <Badge tone="teal">{t('categories', { count: menu.categories.length })}</Badge>
                </div>
                <h3 className="mt-2 text-2xl font-black text-stone-950">
                  {textForLocale(menu.name, locale)}
                </h3>
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
                <IconButton
                  label={t('addCategory')}
                  onClick={openCreateCategoryForm}
                  disabled={createCategoryMutation.isPending}
                >
                  <Plus className="size-4" />
                </IconButton>
              </div>

              {formMode === 'category' ? (
                <FormPanel
                  title={editingCategoryId ? t('editCategory') : t('addCategory')}
                  closeLabel={commonT('close')}
                  onClose={closeForm}
                >
                  <form
                    onSubmit={categoryForm.handleSubmit((values) =>
                      editingCategoryId
                        ? saveCategoryMutation.mutate(values)
                        : createCategoryMutation.mutate(values),
                    )}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormInput
                        name="name.en"
                        register={categoryForm.register}
                        errors={categoryForm.formState.errors}
                        placeholder={t('categoryNameInEnglish')}
                      />
                      <FormInput
                        name="name.ar"
                        register={categoryForm.register}
                        errors={categoryForm.formState.errors}
                        placeholder={t('categoryNameInArabic')}
                      />
                      <FormInput
                        name="description.en"
                        register={categoryForm.register}
                        errors={categoryForm.formState.errors}
                        placeholder={t('descriptionInEnglish')}
                      />
                      <FormInput
                        name="description.ar"
                        register={categoryForm.register}
                        errors={categoryForm.formState.errors}
                        placeholder={t('descriptionInArabic')}
                      />
                      <FormInput
                        name="imageUrl"
                        type="url"
                        register={categoryForm.register}
                        errors={categoryForm.formState.errors}
                        placeholder={t('categoryImageUrl')}
                      />
                      {/* <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold">
                        <input type="checkbox" {...categoryForm.register('active')} />
                        {t('activeCategory')}
                      </label> */}
                    </div>
                    <div className="flex mt-4 gap-2 justify-end">
                      {editingCategoryId ? (
                        <button
                          type="button"
                          className="ms-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100"
                          onClick={() => deleteCategoryMutation.mutate(editingCategoryId)}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className="size-4" />
                          {t('deleteCategory')}
                        </button>
                      ) : null}
                      <PrimaryButton
                        type="submit"
                        disabled={createCategoryMutation.isPending || saveCategoryMutation.isPending}
                      >
                        <CheckCircle2 className="size-4" />
                        {editingCategoryId ? t('saveCategory') : t('createCategory')}
                      </PrimaryButton>
                    </div>
                    {createCategoryMutation.error ? (
                      <p className="mt-2 text-sm text-red-700">{readError(createCategoryMutation.error)}</p>
                    ) : null}
                    {saveCategoryMutation.error ? (
                      <p className="mt-2 text-sm text-red-700">{readError(saveCategoryMutation.error)}</p>
                    ) : null}
                    {deleteCategoryMutation.error ? (
                      <p className="mt-2 text-sm text-red-700">{readError(deleteCategoryMutation.error)}</p>
                    ) : null}
                  </form>
                </FormPanel>
              ) : null}

              {formMode === 'item' ? (
                <FormPanel
                  title={editingItemContext ? t('editItem') : t('addItem')}
                  closeLabel={commonT('close')}
                  onClose={closeForm}
                >
                  <form
                    onSubmit={itemForm.handleSubmit((values) =>
                      editingItemContext
                        ? saveItemMutation.mutate(values)
                        : createItemMutation.mutate(values),
                    )}
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormSelect
                          name="categoryId"
                          register={itemForm.register}
                          errors={itemForm.formState.errors}
                          disabled={Boolean(editingItemContext)}
                          className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary sm:col-span-2"
                        >
                          {menu.categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {textForLocale(category.name, locale)}
                            </option>
                          ))}
                        </FormSelect>
                        <FormInput
                          name="name.en"
                          register={itemForm.register}
                          errors={itemForm.formState.errors}
                          placeholder={t('itemNameInEnglish')}
                        />
                        <FormInput
                          name="name.ar"
                          register={itemForm.register}
                          errors={itemForm.formState.errors}
                          placeholder={t('itemNameInArabic')}
                        />
                        <FormTextarea
                          name="description.en"
                          register={itemForm.register}
                          errors={itemForm.formState.errors}
                          placeholder={t('descriptionInEnglish')}
                        />
                        <FormTextarea
                          name="description.ar"
                          register={itemForm.register}
                          errors={itemForm.formState.errors}
                          placeholder={t('descriptionInArabic')}
                        />
                        <FormInput
                          name="imageUrl"
                          type="url"
                          register={itemForm.register}
                          errors={itemForm.formState.errors}
                          placeholder={t('imageUrl')}
                          className="h-11 rounded-xl border border-border px-3 outline-none focus:border-primary sm:col-span-2"
                        />
                        <FormInput
                          name="tags"
                          register={itemForm.register}
                          errors={itemForm.formState.errors}
                          placeholder={t('tagsSeparated')}
                        />
                        <FormInput
                          name="calories"
                          type="number"
                          register={itemForm.register}
                          errors={itemForm.formState.errors}
                          placeholder={t('calories')}
                          inputMode="numeric"
                        />
                        <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-bold">
                          <input type="checkbox" {...itemForm.register('available')} />
                          {t('available')}
                        </label>
                      </div>
                      <div className="rounded-2xl border border-border bg-stone-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-stone-900">{t('multiLabeledPrices')}</p>
                            <p className="text-xs text-muted-foreground">{t('multiLabeledPricesBody')}</p>
                          </div>
                          <button
                            className={cx(
                              'relative h-7 w-12 shrink-0 rounded-full transition',
                              watchedPriceMode === 'multi' ? 'bg-primary' : 'bg-stone-300',
                            )}
                            onClick={() =>
                              itemForm.setValue(
                                'priceMode',
                                watchedPriceMode === 'multi' ? 'single' : 'multi',
                                { shouldDirty: true, shouldValidate: true },
                              )
                            }
                            type="button"
                          >
                            <span
                              className={cx(
                                'absolute top-1 size-5 rounded-full bg-white shadow transition',
                                watchedPriceMode === 'multi' ? 'left-6' : 'left-1',
                              )}
                            />
                          </button>
                        </div>

                        {watchedPriceMode !== 'multi' ? (
                          <FormInput
                            name="singlePrice"
                            register={itemForm.register}
                            errors={itemForm.formState.errors}
                            placeholder={t('regularPrice')}
                            inputMode="decimal"
                            className="mt-3 h-11 w-full rounded-xl border border-border bg-white px-3 outline-none focus:border-primary"
                          />
                        ) : (
                          <div className="mt-3 space-y-2">
                            {priceFields.map((price, index) => (
                              <div key={price.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                <FormInput
                                  name={`prices.${index}.label`}
                                  register={itemForm.register}
                                  errors={itemForm.formState.errors}
                                  placeholder={t('label')}
                                  className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary"
                                />
                                <FormInput
                                  name={`prices.${index}.price`}
                                  register={itemForm.register}
                                  errors={itemForm.formState.errors}
                                  placeholder={t('price')}
                                  inputMode="decimal"
                                  className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary"
                                />
                                <IconButton
                                  label={t('removePrice')}
                                  onClick={() => removePrice(index)}
                                  disabled={priceFields.length === 1}
                                >
                                  <X className="size-4" />
                                </IconButton>
                              </div>
                            ))}
                            <button
                              className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-bold text-stone-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
                              onClick={() => appendPrice({ label: '', price: '' })}
                              disabled={priceFields.length >= 5}
                              type="button"
                            >
                              {t('addPriceOption')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <PrimaryButton
                        type="submit"
                        disabled={createItemMutation.isPending || saveItemMutation.isPending}
                      >
                        <CheckCircle2 className="size-4" />
                        {editingItemContext ? t('saveItem') : t('createItem')}
                      </PrimaryButton>
                      {editingItemContext ? (
                        <button
                          type="button"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100"
                          onClick={() => deleteItemMutation.mutate(editingItemContext)}
                          disabled={deleteItemMutation.isPending}
                        >
                          <Trash2 className="size-4" />
                          {t('deleteItem')}
                        </button>
                      ) : null}
                    </div>
                    {createItemMutation.error ? (
                      <p className="mt-2 text-sm text-red-700">{readError(createItemMutation.error)}</p>
                    ) : null}
                    {saveItemMutation.error ? (
                      <p className="mt-2 text-sm text-red-700">{readError(saveItemMutation.error)}</p>
                    ) : null}
                    {deleteItemMutation.error ? (
                      <p className="mt-2 text-sm text-red-700">{readError(deleteItemMutation.error)}</p>
                    ) : null}
                  </form>
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
                        <Badge tone={category.active ? 'green' : 'muted'}>
                          {category.active ? t('active') : t('hidden')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('itemCount', { count: category.items.length })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className={cx(
                          'relative h-7 w-12 rounded-full transition disabled:opacity-50',
                          category.active ? 'bg-primary' : 'bg-stone-300',
                        )}
                        onClick={() =>
                          toggleCategoryMutation.mutate({ categoryId: category.id, active: !category.active })
                        }
                        disabled={toggleCategoryMutation.isPending}
                        aria-label={category.active ? t('deactivateCategory') : t('activateCategory')}
                      >
                        <span
                          className={cx(
                            'absolute top-1 size-5 rounded-full bg-white shadow transition',
                            category.active ? 'left-6' : 'left-1',
                          )}
                        />
                      </button>
                      <IconButton label={t('editCategory')} onClick={() => openEditCategoryForm(category)}>
                        <Edit3 className="size-4" />
                      </IconButton>
                      <IconButton
                        label={t('deleteCategory')}
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.items.length > 0 ? (
                      category.items.map((item) => (
                        <div
                          key={item.id}
                          className="grid gap-3 rounded-2xl border border-border bg-stone-50 p-3 sm:grid-cols-[64px_1fr_auto] sm:items-center"
                        >
                          <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-white">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="size-full object-cover" />
                            ) : (
                              <ImageIcon className="size-5 text-stone-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-stone-900">{textForLocale(item.name, locale)}</p>
                              {item.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} tone="teal">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {textForLocale(item.description, locale) || t('noDescription')}
                            </p>
                            <p className="mt-1 text-xs font-bold text-primary">
                              {itemPriceText(item, currency, t('noPrice'))}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <button
                              className={cx(
                                'relative h-7 w-12 rounded-full transition disabled:opacity-50',
                                item.available ? 'bg-primary' : 'bg-stone-300',
                              )}
                              onClick={() =>
                                toggleItemMutation.mutate({
                                  categoryId: category.id,
                                  itemId: item.id,
                                  available: !item.available,
                                })
                              }
                              disabled={toggleItemMutation.isPending}
                              aria-label={item.available ? t('available') : t('hidden')}
                            >
                              <span
                                className={cx(
                                  'absolute top-1 size-5 rounded-full bg-white shadow transition',
                                  item.available ? 'left-6' : 'left-1',
                                )}
                              />
                            </button>
                            <IconButton
                              label={t('editItem')}
                              onClick={() => openEditItemForm(category, item)}
                            >
                              <Edit3 className="size-4" />
                            </IconButton>
                            <IconButton
                              label={t('deleteItem')}
                              onClick={() =>
                                deleteItemMutation.mutate({ categoryId: category.id, itemId: item.id })
                              }
                              disabled={deleteItemMutation.isPending}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </IconButton>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl bg-stone-50 p-3 text-sm text-muted-foreground">
                        {t('noItemsInCategory')}
                      </p>
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
              <PrimaryButton onClick={openCreateItemForm} disabled={menu.categories.length === 0}>
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
