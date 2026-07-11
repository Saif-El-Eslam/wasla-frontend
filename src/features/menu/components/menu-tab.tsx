'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Menu as MenuIcon, CheckCircle2, GitBranch, Plus, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  api,
  type CreateCategoryInput,
  type CreateItemInput,
  type Menu,
  type MenuCategory,
  type MenuItem,
} from '@/lib/api';
import {
  Badge,
  BranchSelect,
  Card,
  EmptyState,
  FormPanel,
  PrimaryButton,
  TabLoader,
  LoadingSpinner,
} from '@/components/ui/dashboard-ui';
import { readError, toLocalized, type LocalizedDraft } from '@/features/dashboard/utils/dashboard-utils';
import { FormInput } from '@/components/ui/form-input';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { MenuExtractionPanel } from './extraction/menu-extraction-panel';
import { MenuItemsSection } from './items/menu-items-section';
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
import { PublicPreview } from '@/features/public/components/menu/public-preview';
import { cleanupUploadedImages, uploadImageDirect } from '@/lib/api/image-upload';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [formMode, setFormMode] = useState<'menu' | 'category' | 'item' | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemContext, setEditingItemContext] = useState<{ categoryId: string; itemId: string } | null>(
    null,
  );
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ categoryId: string; itemId: string } | null>(null);
  const activeTab = searchParams.get('menuView') === 'preview' ? 'preview' : 'build';
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const menuForm = useForm<MenuFormInput, unknown, MenuFormValues>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: {},
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

  const handleTabChange = (tab: 'build' | 'preview') => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (tab === 'preview') {
      nextParams.set('menuView', 'preview');
    } else {
      nextParams.delete('menuView');
    }

    const query = nextParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });

    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };
  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryImageFile(null);
    categoryForm.reset({
      name: draftWithFallback(),
      description: draftWithFallback(),
      imageUrl: '',
      active: true,
    });
  };

  const resetItemForm = () => {
    setEditingItemContext(null);
    setItemImageFile(null);
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
    setCategoryImageFile(null);
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
    setItemImageFile(null);
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
    mutationFn: () =>
      api.createBranchMenu(effectiveBranchId, {
        theme: 'MODERN',
        showPrices: true,
      }),
    onSuccess: ({ menu: createdMenu }) => {
      replaceCachedMenu(queryClient, effectiveBranchId, createdMenu);
      menuForm.reset({});
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

  const categoryPayload = (values: CategoryFormValues, imageUrl = values.imageUrl || undefined) => {
    const description = draftWithFallback(values.description);

    return {
      name: toLocalized(values.name, t('addCategory')),
      description: description.en || description.ar ? toLocalized(description, '') : undefined,
      imageUrl,
      active: values.active,
    } satisfies CreateCategoryInput;
  };

  const buildCategoryPayload = async (values: CategoryFormValues) => {
    const uploadedUrls: string[] = [];

    try {
      const imageUrl = categoryImageFile
        ? (await uploadImageDirect(categoryImageFile, 'menu-category')).url
        : values.imageUrl || undefined;
      if (categoryImageFile && imageUrl) {
        uploadedUrls.push(imageUrl);
      }

      return { payload: categoryPayload(values, imageUrl), uploadedUrls };
    } catch (error) {
      await cleanupUploadedImages(uploadedUrls);
      throw error;
    }
  };

  const categoryCachePatch = (payload: CreateCategoryInput): Partial<MenuCategory> => {
    return {
      ...payload,
      description: payload.description ?? null,
      imageUrl: payload.imageUrl ?? null,
    };
  };

  const createCategoryMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const { payload, uploadedUrls } = await buildCategoryPayload(values);

      try {
        const result = await api.createCategory(effectiveBranchId, payload);

        return { result, payload };
      } catch (error) {
        await cleanupUploadedImages(uploadedUrls);
        throw error;
      }
    },
    onSuccess: ({ result, payload }) => {
      const { category } = result;
      const patch = categoryCachePatch(payload);
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
    mutationFn: async (values: CategoryFormValues) => {
      if (!editingCategoryId) {
        throw new Error('No category selected');
      }

      const { payload, uploadedUrls } = await buildCategoryPayload(values);

      try {
        const result = await api.updateCategory(effectiveBranchId, editingCategoryId, payload);

        return { result, payload };
      } catch (error) {
        await cleanupUploadedImages(uploadedUrls);
        throw error;
      }
    },
    onSuccess: ({ result, payload }) => {
      const { category } = result;
      if (editingCategoryId) {
        replaceCachedCategory(queryClient, effectiveBranchId, editingCategoryId, {
          ...category,
          ...categoryCachePatch(payload),
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

  const itemPayload = (values: ItemFormValues, imageUrl = values.imageUrl || undefined) => {
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
      imageUrl,
      prices: pricePayload,
      available: values.available,
      tags: (values.tags ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      calories: values.calories,
    } satisfies CreateItemInput;
  };

  const buildItemPayload = async (values: ItemFormValues) => {
    const uploadedUrls: string[] = [];

    try {
      const imageUrl = itemImageFile
        ? (await uploadImageDirect(itemImageFile, 'menu-item')).url
        : values.imageUrl || undefined;
      if (itemImageFile && imageUrl) {
        uploadedUrls.push(imageUrl);
      }

      return { payload: itemPayload(values, imageUrl), uploadedUrls };
    } catch (error) {
      await cleanupUploadedImages(uploadedUrls);
      throw error;
    }
  };

  const itemCachePatch = (payload: CreateItemInput): Partial<MenuItem> => {
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
    mutationFn: async (values: ItemFormValues) => {
      const { payload, uploadedUrls } = await buildItemPayload(values);

      try {
        const result = await api.createItem(effectiveBranchId, values.categoryId, payload);

        return { result, payload, categoryId: values.categoryId };
      } catch (error) {
        await cleanupUploadedImages(uploadedUrls);
        throw error;
      }
    },
    onSuccess: ({ result, payload, categoryId }) => {
      const { item } = result;
      const patch = itemCachePatch(payload);
      addCachedItem(queryClient, effectiveBranchId, categoryId, { ...item, ...patch });
      resetItemForm();
      setFormMode(null);
    },
  });

  const saveItemMutation = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      if (!editingItemContext) {
        throw new Error('No item selected');
      }

      const { payload, uploadedUrls } = await buildItemPayload(values);

      try {
        const result = await api.updateItem(
          effectiveBranchId,
          editingItemContext.categoryId,
          editingItemContext.itemId,
          payload,
        );

        return { result, payload };
      } catch (error) {
        await cleanupUploadedImages(uploadedUrls);
        throw error;
      }
    },
    onSuccess: ({ result, payload }) => {
      const { item } = result;
      if (editingItemContext) {
        replaceCachedItem(
          queryClient,
          effectiveBranchId,
          editingItemContext.categoryId,
          editingItemContext.itemId,
          {
            ...item,
            ...itemCachePatch(payload),
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
      {menuQuery.isLoading ? (
        <TabLoader label={t('loadingWorkspace')} />
      ) : !menu ? (
        <>
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge tone="amber">{t('noMenu')}</Badge>
                  <p className="text-sm font-bold text-stone-900">
                    {branch ? textForLocale(branch.name, locale) : t('selectedBranch')}
                  </p>
                </div>
                <h3 className="mt-3 text-xl font-black text-stone-950">{t('branchHasNoMenu')}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('createMenuBeforeContent')}</p>
              </div>
              <div className="flex flex-col w-full gap-2 justify-start sm:w-auto sm:justify-end">
                <BranchSelect
                  branches={branches}
                  value={effectiveBranchId}
                  onChange={setLocalBranchId}
                  locale={locale}
                />

                <PrimaryButton onClick={() => setFormMode('menu')} loading={createMenuMutation.isPending}>
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
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      createMenuMutation.mutate();
                    }}
                  >
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
          <MenuExtractionPanel
            branchId={effectiveBranchId}
            branchName={branch?.name}
            menu={menu}
            locale={locale}
          />
        </>
      ) : (
        <>
          <Card className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-stone-500">
                  <GitBranch className="size-3.5" />
                  <span>{t('branch') || 'Branch'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-stone-950">
                    {textForLocale(branch?.name, locale) || 'Main Branch'}
                  </h3>

                  <Badge tone="teal">{branch?.isMain ? 'main' : t('branch') || 'branch'}</Badge>

                  <Badge tone={menu.publishedAt ? 'teal' : 'muted'}>
                    {menu.publishedAt ? t('published') : t('draft')}
                  </Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                  <span>{t('categories', { count: menu.categories.length })}</span>

                  <span className="text-stone-300">•</span>

                  <span className="font-medium text-stone-700">{textForLocale(branch?.name, locale)}</span>

                  <span className="text-stone-300">•</span>

                  <span>
                    {t('itemsInBranch', {
                      items: menu.categories.reduce((sum, category) => sum + category.items.length, 0),
                      branch: branch ? textForLocale(branch.name, locale) : t('selectedBranch'),
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col w-full gap-2 justify-start sm:w-auto sm:justify-end">
                <BranchSelect
                  branches={branches}
                  value={effectiveBranchId}
                  onChange={setLocalBranchId}
                  locale={locale}
                />

                <button
                  type="button"
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-teal-600/25 transition-colors hover:bg-teal-700 disabled:pointer-events-none disabled:opacity-60"
                >
                  {publishMutation.isPending
                    ? t('loading') || 'Loading...'
                    : menu.publishedAt
                      ? t('unpublish')
                      : t('publish')}
                </button>
              </div>
            </div>
          </Card>
          <MenuExtractionPanel
            branchId={effectiveBranchId}
            menu={menu}
            locale={locale}
            branchName={branch?.name}
          />

          <div className="space-y-2">
            <div className="flex rounded-3xl bg-stone-100 p-1">
              <button
                onClick={() => handleTabChange('build')}
                className={`flex-1 rounded-3xl py-2 font-semibold transition-all ${
                  activeTab === 'build'
                    ? 'bg-white text-stone-900 shadow text-sm'
                    : 'text-stone-500 hover:text-stone-700 text-xs'
                }`}
              >
                Build
              </button>

              <button
                onClick={() => handleTabChange('preview')}
                className={`flex-1 rounded-3xl py-2 font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-stone-900 shadow text-sm'
                    : 'text-stone-500 hover:text-stone-700 text-xs'
                }`}
              >
                Preview
              </button>
            </div>

            <div ref={contentRef}>
              {activeTab === 'build' && (
                <div className="space-y-3">
                  <MenuItemsSection
                    menu={menu}
                    locale={locale}
                    currency={currency}
                    formMode={formMode}
                    itemForm={itemForm}
                    onCloseItemForm={closeForm}
                    onOpenCreateItemForm={openCreateItemForm}
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
                    imageFile={itemImageFile}
                    onImageFileChange={setItemImageFile}
                    categoryForm={categoryForm}
                    editingCategoryId={editingCategoryId}
                    toggleCategoryPending={toggleCategoryMutation.isPending}
                    onSubmitCategoryForm={(values) =>
                      editingCategoryId
                        ? saveCategoryMutation.mutate(values)
                        : createCategoryMutation.mutate(values)
                    }
                    onEditCategory={openEditCategoryForm}
                    onDeleteCategory={setCategoryToDelete}
                    onOpenCreateCategoryForm={openCreateCategoryForm}
                    onCloseCategoryForm={closeForm}
                    createCategoryPending={createCategoryMutation.isPending}
                    saveCategoryPending={saveCategoryMutation.isPending}
                    categoryImageFile={categoryImageFile}
                    onCategoryImageFileChange={setCategoryImageFile}
                    onToggleCategory={(categoryId, active) =>
                      toggleCategoryMutation.mutate({ categoryId, active })
                    }
                  />
                </div>
              )}

              {activeTab === 'preview' && (
                <PublicPreview branchId={effectiveBranchId} locale={locale} currency={currency} />
              )}
            </div>
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
