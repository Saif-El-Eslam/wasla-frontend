'use client';

import { useEffect, useState } from 'react';
import { Badge, Card, IconButton, PrimaryButton } from '@/components/ui/dashboard-ui';
import { EmptyState } from '@/components/ui/dashboard-ui';
import { useTranslations } from 'next-intl';
import { ImageIcon, Edit3, Plus, Trash2, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { textForLocale } from '@/lib/localized-text';
import type { Menu, MenuCategory, MenuItem } from '@/lib/api';
import { MenuItemForm } from './menu-item-form';
import type { UseFormReturn } from 'react-hook-form';
import type { ItemFormInput, ItemFormValues } from '@/features/menu/schemas/menu.schema';
import { ItemPrices } from '@/components/ui/item-prices';

export function MenuItemsSection({
  menu,
  locale,
  currency,
  formMode,
  itemForm,
  onOpenCreateItemForm,
  onCloseItemForm,
  onSubmitItemForm,
  createItemPending,
  saveItemPending,
  toggleItemPending,
  deleteItemPending,
  editingItemContext,
  onEditItem,
  onToggleItem,
  setItemToDelete,
  itemToDelete,
  error,
}: {
  menu: Menu;
  locale: string;
  currency: string;
  formMode: 'menu' | 'category' | 'item' | null;
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

  useEffect(() => {
    if (!openActionsItemId) {
      return;
    }

    const closeActionsOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Element | null;

      if (target?.closest('[data-item-actions-root]')) {
        return;
      }

      setOpenActionsItemId(null);
    };

    document.addEventListener('pointerdown', closeActionsOnOutsideClick);

    return () => document.removeEventListener('pointerdown', closeActionsOnOutsideClick);
  }, [openActionsItemId]);

  return (
    <div className="space-y-3">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-black text-stone-950">{t('addMenuItem')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('itemsCreatedUnderCategory')}</p>
        </div>
        <PrimaryButton
          onClick={onOpenCreateItemForm}
          disabled={menu.categories.length === 0 || createItemPending || saveItemPending}
        >
          <Plus className="size-4" />
          {t('addItem')}
        </PrimaryButton>
      </Card>

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
            </div>
            <div className="space-y-2">
              {category.items.length > 0 ? (
                category.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-2xl border border-border bg-stone-50 p-3 grid-cols-[auto_1fr_auto] sm:items-center"
                  >
                    <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-white">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="size-full object-cover" />
                      ) : (
                        <ImageIcon className="size-5 text-stone-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-col flex-wrap items-start gap-1 sm:gap-2 sm:flex-row">
                        <p className="font-bold text-stone-900">{textForLocale(item.name, locale)}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.tags.slice(0, 5).map((tag) => (
                            <Badge key={tag} tone="teal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground wrap">
                        {textForLocale(item.description, locale) || t('noDescription')}
                      </p>
                      <ItemPrices prices={item.prices} currency={currency} noPriceText={t('noPrice')} />
                    </div>

                    <div className="relative flex flex-wrap items-center gap-2 justify-end">
                      <button
                        className={`hidden sm:block relative h-7 w-12 rounded-full transition disabled:opacity-50 ${item.available ? 'bg-primary' : 'bg-stone-300'}`}
                        onClick={() => onToggleItem(category.id, item.id, !item.available)}
                        disabled={toggleItemPending}
                        aria-label={item.available ? t('available') : t('hidden')}
                      >
                        <span
                          className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${item.available ? 'left-6' : 'left-1'}`}
                        />
                      </button>
                      <div data-item-actions-root>
                        <IconButton
                          label={t('itemActions')}
                          onClick={() =>
                            setOpenActionsItemId((current) => (current === item.id ? null : item.id))
                          }
                        >
                          <MoreVertical className="size-4" />
                        </IconButton>
                        {openActionsItemId === item.id ? (
                          <div className="absolute end-0 top-10 z-20 w-52 rounded-2xl border border-border bg-white p-2 shadow-2xl">
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
                              className="sm:hidden flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                              onClick={() => {
                                setOpenActionsItemId(null);
                                onToggleItem(category.id, item.id, !item.available);
                              }}
                              disabled={toggleItemPending}
                            >
                              {item.available ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
        <EmptyState title={t('addFirstCategory')} body={t('categoryNeeded')} icon={undefined as any} />
      )}
    </div>
  );
}
