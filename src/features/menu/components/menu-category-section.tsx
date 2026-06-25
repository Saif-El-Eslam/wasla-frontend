'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge, Card, IconButton, PrimaryButton, SectionTitle } from '@/components/ui/dashboard-ui';
import { EmptyState } from '@/components/ui/dashboard-ui';
import { MenuCategoryForm } from './menu-category-form';
import { Trash2, Edit3, Plus, UtensilsCrossed, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { textForLocale } from '@/lib/localized-text';
import type { MenuCategory } from '@/lib/api';
import type { UseFormReturn } from 'react-hook-form';
import type { CategoryFormInput, CategoryFormValues } from '@/features/menu/schemas/menu.schema';

export function MenuCategorySection({
  categories,
  locale,
  formMode,
  editingCategoryId,
  categoryForm,
  onOpenCreateCategoryForm,
  onCloseCategoryForm,
  onSubmitCategoryForm,
  onEditCategory,
  onToggleCategory,
  onDeleteCategory,
  createCategoryPending,
  saveCategoryPending,
  toggleCategoryPending,
  deleteCategoryPending,
  error,
}: {
  categories: MenuCategory[];
  locale: string;
  formMode: 'menu' | 'category' | 'item' | null;
  editingCategoryId: string | null;
  categoryForm: UseFormReturn<CategoryFormInput, unknown, CategoryFormValues>;
  onOpenCreateCategoryForm: () => void;
  onCloseCategoryForm: () => void;
  onSubmitCategoryForm: (values: CategoryFormValues) => void;
  onEditCategory: (category: MenuCategory) => void;
  onToggleCategory: (categoryId: string, active: boolean) => void;
  onDeleteCategory: (categoryId: string) => void;
  createCategoryPending: boolean;
  saveCategoryPending: boolean;
  toggleCategoryPending: boolean;
  deleteCategoryPending: boolean;
  error?: unknown;
}) {
  const t = useTranslations('dashboard');
  const [openActionsCategoryId, setOpenActionsCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!openActionsCategoryId) {
      return;
    }

    const closeActionsOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Element | null;

      if (target?.closest('[data-category-actions-root]')) {
        return;
      }

      setOpenActionsCategoryId(null);
    };

    document.addEventListener('pointerdown', closeActionsOnOutsideClick);

    return () => document.removeEventListener('pointerdown', closeActionsOnOutsideClick);
  }, [openActionsCategoryId]);

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle eyebrow={t('build')} title={t('categoriesTitle')} />
          <PrimaryButton
            onClick={onOpenCreateCategoryForm}
            disabled={createCategoryPending || saveCategoryPending}
          >
            <Plus className="size-4" />
            {t('addCategory')}
          </PrimaryButton>
        </div>
      </Card>

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

      <div className="grid gap-3 xl:grid-cols-2">
        {categories.length > 0 ? (
          categories.map((category) => (
            <Card key={category.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-stone-950">{textForLocale(category.name, locale)}</h3>
                    <Badge tone={category.active ? 'green' : 'muted'}>
                      {category.active ? t('active') : t('hidden')}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('itemCount', { count: category.items.length })}
                  </p>
                </div>
                <div className="relative flex items-center gap-2">
                  <button
                    className="relative h-7 w-12 rounded-full transition disabled:opacity-50"
                    onClick={() => onToggleCategory(category.id, !category.active)}
                    disabled={toggleCategoryPending}
                    aria-label={category.active ? t('deactivate') : t('activate')}
                    type="button"
                  >
                    <span
                      className={`absolute top-1 size-5 rounded-full bg-white shadow transition ${category.active ? 'left-6' : 'left-1'}`}
                    />
                  </button>
                  <div data-category-actions-root>
                    <IconButton
                      label={t('categoryActions')}
                      onClick={() =>
                        setOpenActionsCategoryId((current) => (current === category.id ? null : category.id))
                      }
                    >
                      <MoreVertical className="size-4" />
                    </IconButton>
                    {openActionsCategoryId === category.id ? (
                      <div className="absolute end-0 top-10 z-20 w-52 rounded-2xl border border-border bg-white p-2 shadow-2xl">
                        <button
                          className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                          onClick={() => {
                            setOpenActionsCategoryId(null);
                            onEditCategory(category);
                          }}
                        >
                          <Edit3 className="size-4" />
                          {t('editCategory')}
                        </button>
                        <button
                          className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                          onClick={() => {
                            setOpenActionsCategoryId(null);
                            onToggleCategory(category.id, !category.active);
                          }}
                          disabled={toggleCategoryPending}
                        >
                          {category.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          {category.active ? t('deactivate') : t('activate')}
                        </button>
                        <button
                          className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                          onClick={() => {
                            setOpenActionsCategoryId(null);
                            onDeleteCategory(category.id);
                          }}
                        >
                          <Trash2 className="size-4 text-red-600" />
                          {t('deleteCategory')}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState title={t('addFirstCategory')} body={t('categoryNeeded')} icon={UtensilsCrossed} />
        )}
      </div>
    </div>
  );
}
