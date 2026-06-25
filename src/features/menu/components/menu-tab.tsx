'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, CheckCircle2, Plus, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { api, type Menu, type MenuCategory, type MenuItem } from '@/lib/api';
import {
  Badge,
  BranchSelect,
  Card,
  EmptyState,
  FormPanel,
  PrimaryButton,
  SectionTitle,
  TabLoader,
} from '@/components/ui/dashboard-ui';
import { readError, toLocalized, type LocalizedDraft } from '@/features/dashboard/utils/dashboard-utils';
import { FormInput } from '@/components/ui/form-input';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { MenuExtractionPanel } from './menu-extraction-panel';
import { MenuCategorySection } from './menu-category-section';
import { MenuItemsSection } from './menu-items-section';
import type { UseFormReturn } from 'react-hook-form';
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
import { useForm } from 'react-hook-form';
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
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ categoryId: string; itemId: string } | null>(null);
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
      addCachedCategory(queryClient, effectiveBranchId, {
        ...category,
        ...patch,
        items: category.items ?? [],
      });
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
      replaceCachedCategory(queryClient, effectiveBranchId, variables.categoryId, {
        active: category.active,
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId: string) => api.deleteCategory(effectiveBranchId, categoryId),
    onSuccess: (_result, categoryId) => {
      removeCachedCategory(queryClient, effectiveBranchId, categoryId);
      closeForm();
      setCategoryToDelete(null);
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
        replaceCachedItem(
          queryClient,
          effectiveBranchId,
          editingItemContext.categoryId,
          editingItemContext.itemId,
          {
            ...item,
            ...itemCachePatch(values),
          },
        );
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
      setItemToDelete(null);
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
        <>
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
                      <PrimaryButton type="submit" loading={createMenuMutation.isPending}>
                        <CheckCircle2 className="size-4" />
                        {t('createMenu')}
                      </PrimaryButton>
                    </div>
                  </form>
                </FormPanel>
              </div>
            ) : null}
          </Card>
          <MenuExtractionPanel branchId={effectiveBranchId} menu={menu} locale={locale} />
        </>
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
              <PrimaryButton onClick={() => publishMutation.mutate()} loading={publishMutation.isPending}>
                <CheckCircle2 className="size-4" />
                {menu.publishedAt ? t('unpublish') : t('publish')}
              </PrimaryButton>
            </div>
          </Card>
          <MenuExtractionPanel branchId={effectiveBranchId} menu={menu} locale={locale} />

          <div className="space-y-3">
            <MenuCategorySection
              categories={menu.categories}
              locale={locale}
              formMode={formMode}
              editingCategoryId={editingCategoryId}
              categoryForm={categoryForm}
              onOpenCreateCategoryForm={openCreateCategoryForm}
              onCloseCategoryForm={closeForm}
              onSubmitCategoryForm={(values) =>
                editingCategoryId
                  ? saveCategoryMutation.mutate(values)
                  : createCategoryMutation.mutate(values)
              }
              onEditCategory={openEditCategoryForm}
              onToggleCategory={(categoryId, active) => toggleCategoryMutation.mutate({ categoryId, active })}
              onDeleteCategory={setCategoryToDelete}
              createCategoryPending={createCategoryMutation.isPending}
              saveCategoryPending={saveCategoryMutation.isPending}
              toggleCategoryPending={toggleCategoryMutation.isPending}
              deleteCategoryPending={deleteCategoryMutation.isPending}
              error={
                createCategoryMutation.error ?? saveCategoryMutation.error ?? deleteCategoryMutation.error
              }
            />

            <MenuItemsSection
              menu={menu}
              locale={locale}
              currency={currency}
              formMode={formMode}
              itemForm={itemForm}
              onOpenCreateItemForm={openCreateItemForm}
              onCloseItemForm={closeForm}
              onSubmitItemForm={(values) =>
                editingItemContext ? saveItemMutation.mutate(values) : createItemMutation.mutate(values)
              }
              createItemPending={createItemMutation.isPending}
              saveItemPending={saveItemMutation.isPending}
              toggleItemPending={toggleItemMutation.isPending}
              deleteItemPending={deleteItemMutation.isPending}
              editingItemContext={editingItemContext}
              onEditItem={openEditItemForm}
              onToggleItem={(categoryId, itemId, available) =>
                toggleItemMutation.mutate({ categoryId, itemId, available })
              }
              setItemToDelete={setItemToDelete}
              itemToDelete={itemToDelete}
              error={createItemMutation.error ?? saveItemMutation.error ?? deleteItemMutation.error}
            />
          </div>
        </>
      )}

      {itemToDelete && (
        <ConfirmationModal
          open={!!itemToDelete}
          setOpen={(open) => !open && !deleteItemMutation.isPending && setItemToDelete(null)}
          title={t('deleteItem')}
          description={t('deleteItemWarning')}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          confirmLoading={deleteItemMutation.isPending}
          onConfirm={() => deleteItemMutation.mutate(itemToDelete)}
        />
      )}
      {categoryToDelete && (
        <ConfirmationModal
          open={!!categoryToDelete}
          setOpen={(open) => !open && !deleteCategoryMutation.isPending && setCategoryToDelete(null)}
          title={t('deleteCategory')}
          description={t('deleteCategoryWarning')}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          confirmLoading={deleteCategoryMutation.isPending}
          onConfirm={() => deleteCategoryMutation.mutate(categoryToDelete)}
        />
      )}
    </div>
  );
}
