'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/dashboard-ui';
import { EmptyState } from '@/components/ui/dashboard-ui';
import { useTranslations } from 'next-intl';
import { Edit3, Eye, EyeOff, ImageIcon, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { textForLocale } from '@/lib/localized-text';
import type { Menu, MenuCategory, MenuItem } from '@/lib/api';
import { MenuItemForm } from './menu-item-form';
import { MenuCategoryForm } from '../categories/menu-category-form';
import type { UseFormReturn } from 'react-hook-form';
import type {
  CategoryFormInput,
  CategoryFormValues,
  ItemFormInput,
  ItemFormValues,
} from '@/features/menu/schemas/menu.schema';
import { MenuCategoryHeader } from '@/features/menu/components/categories/menu-category-header';
import { ItemPrices } from '@/components/ui/item-prices';

export function MenuItemsSection({
  menu,
  locale,
  currency,
  formMode,
  categoryForm,
  editingCategoryId,
  onToggleCategory,
  toggleCategoryPending,
  onSubmitCategoryForm,
  onOpenCreateCategoryForm,
  onCloseCategoryForm,
  onEditCategory,
  onDeleteCategory,
  onOpenCreateItemForm,
  createCategoryPending,
  saveCategoryPending,
  itemForm,
  onCloseItemForm,
  onSubmitItemForm,
  createItemPending,
  saveItemPending,
  toggleItemPending,
  editingItemContext,
  onEditItem,
  onToggleItem,
  setItemToDelete,
  error,
}: {
  menu: Menu;
  locale: string;
  currency: string;
  formMode: 'menu' | 'category' | 'item' | null;
  categoryForm: UseFormReturn<CategoryFormInput, unknown, CategoryFormValues>;
  onOpenCreateCategoryForm: () => void;
  onCloseCategoryForm: () => void;
  onEditCategory: (category: MenuCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSubmitCategoryForm: (values: CategoryFormValues) => void;
  saveCategoryPending: boolean;
  createCategoryPending: boolean;
  editingCategoryId: string | null;
  onToggleCategory: (categoryId: string, active: boolean) => void;
  toggleCategoryPending?: boolean;
  itemForm: UseFormReturn<ItemFormInput, unknown, ItemFormValues>;
  onOpenCreateItemForm: () => void;
  onCloseItemForm: () => void;
  onSubmitItemForm: (values: ItemFormValues) => void;
  createItemPending: boolean;
  saveItemPending: boolean;
  toggleItemPending: boolean;
  deleteItemPending: boolean;
  editingItemContext: { categoryId: string; itemId: string } | null;
  onEditItem: (category: MenuCategory, item: MenuItem) => void;
  onToggleItem: (categoryId: string, itemId: string, available: boolean) => void;
  setItemToDelete: (item: { categoryId: string; itemId: string } | null) => void;
  itemToDelete: { categoryId: string; itemId: string } | null;
  error?: unknown;
}) {
  const t = useTranslations('dashboard');

  const [openActionsItemId, setOpenActionsItemId] = useState<string | null>(null);
  const [openCategoryIds, setOpenCategoryIds] = useState<Set<string>>(
    // () => new Set(menu.categories.map((category) => category.id)),
    () => new Set([]),
  );

  useEffect(() => {
    if (!openActionsItemId) return;

    const closeActionsOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Element | null;

      if (target?.closest('[data-item-actions-root]')) return;

      setOpenActionsItemId(null);
    };

    document.addEventListener('pointerdown', closeActionsOnOutsideClick);

    return () => document.removeEventListener('pointerdown', closeActionsOnOutsideClick);
  }, [openActionsItemId]);

  const toggleCategoryOpen = (categoryId: string) => {
    setOpenCategoryIds((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Categories</h2>

        <button
          type="button"
          onClick={onOpenCreateCategoryForm}
          disabled={createCategoryPending || saveCategoryPending}
          className="inline-flex items-center gap-2 rounded-3xl bg-teal-100/50 px-3 py-2 text-teal-700 transition-colors hover:bg-teal-100 hover:text-teal-800 disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="size-3 font-semibold stroke-[2.5]" />
          <span className="text-sm font-semibold">{t('addCategory') || 'Add category'}</span>
        </button>
      </div>

      {formMode === 'item' ? (
        <>
          <MenuItemForm
            open
            title={editingItemContext ? t('editItem') : t('addItem')}
            onClose={onCloseItemForm}
            form={itemForm}
            categories={menu.categories}
            locale={locale}
            onSubmit={onSubmitItemForm}
            pending={editingItemContext ? saveItemPending : createItemPending}
            error={error}
            isEditing={Boolean(editingItemContext)}
          />
          {error ? <p className="mt-2 text-sm text-red-700">{String(error)}</p> : null}
        </>
      ) : null}
      {formMode === 'category' ? (
        <>
          <MenuCategoryForm
            open
            title={editingCategoryId ? t('editCategory') : t('addCategory')}
            onClose={onCloseCategoryForm}
            form={categoryForm}
            onSubmit={onSubmitCategoryForm}
            pending={editingCategoryId ? saveCategoryPending : createCategoryPending}
            error={error}
            isEditing={Boolean(editingCategoryId)}
          />
          {error ? <p className="mt-2 text-sm text-red-700">{String(error)}</p> : null}
        </>
      ) : null}

      {menu.categories.length > 0 ? (
        menu.categories.map((category) => {
          const isOpen = openCategoryIds.has(category.id);

          return (
            <div
              key={category.id}
              className={[
                'rounded-2xl border bg-white transition',
                isOpen ? 'border-primary/50 shadow-[0_8px_24px_rgba(20,184,166,0.16)]' : 'border-stone-200',
              ].join(' ')}
            >
              <MenuCategoryHeader
                category={category}
                locale={locale}
                isOpen={isOpen}
                onToggleOpen={toggleCategoryOpen}
                togglePending={toggleCategoryPending}
                onEditCategory={onEditCategory}
                onToggleCategory={onToggleCategory}
                onDeleteCategory={onDeleteCategory}
              />

              {isOpen ? (
                <div className="border-t border-stone-100 p-4">
                  <div className="space-y-2">
                    {category.items.length > 0 ? (
                      category.items.map((item) => (
                        <div
                          key={item.id}
                          className="min-h-[96px] rounded-2xl border border-stone-200 bg-white p-3 transition"
                        >
                          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                            <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-stone-100">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className="size-full object-cover" />
                              ) : (
                                <ImageIcon className="size-5 text-stone-300" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-bold text-stone-950">
                                  {textForLocale(item.name, locale)}
                                </p>

                                {item.tags.slice(0, 5).map((tag) => (
                                  <Badge key={tag} tone="teal">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              <p className="mt-1 truncate text-xs text-stone-500">
                                {textForLocale(item.description, locale) || t('noDescription')}
                              </p>
                            </div>

                            <div className="relative self-start pt-1" data-item-actions-root>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionsItemId((current) => (current === item.id ? null : item.id))
                                }
                                className="flex size-8 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-50"
                                aria-label={t('itemActions')}
                              >
                                <MoreVertical className="size-4" />
                              </button>

                              {openActionsItemId === item.id ? (
                                <div className="absolute end-0 top-9 z-20 w-52 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl">
                                  <button
                                    className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                                    onClick={() => {
                                      setOpenActionsItemId(null);
                                      onEditItem(category, item);
                                    }}
                                  >
                                    <Edit3 className="size-4" />
                                    {t('editItem')}
                                  </button>

                                  <button
                                    className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                                    onClick={() => {
                                      setOpenActionsItemId(null);
                                      onToggleItem(category.id, item.id, !item.available);
                                    }}
                                    disabled={toggleItemPending}
                                  >
                                    {item.available ? (
                                      <EyeOff className="size-4" />
                                    ) : (
                                      <Eye className="size-4" />
                                    )}
                                    {item.available ? t('hide') : t('show')}
                                  </button>

                                  <button
                                    className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                                    onClick={() => {
                                      setOpenActionsItemId(null);
                                      setItemToDelete({ categoryId: category.id, itemId: item.id });
                                    }}
                                  >
                                    <Trash2 className="size-4 text-red-600" />
                                    {t('deleteItem')}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end border-t border-stone-100">
                            <ItemPrices prices={item.prices} currency={currency} noPriceText={t('noPrice')} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-xl bg-stone-50 p-3 text-sm text-stone-500">
                        {t('noItemsInCategory')}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={onOpenCreateItemForm}
                    disabled={createItemPending || saveItemPending}
                    className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-400 text-sm font-bold text-stone-500 transition
                     hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Plus className="size-4" />
                    {t('addItem')}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })
      ) : (
        <EmptyState title={t('addFirstCategory')} body={t('categoryNeeded')} icon={undefined as any} />
      )}
    </section>
  );
}
