'use client';

import { useEffect, useState } from 'react';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, IconButton } from '@/components/ui/dashboard-ui';
import { Trash2, Edit3, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { textForLocale } from '@/lib/localized-text';
import type { MenuCategory } from '@/lib/api';

export function MenuCategoryHeader({
  category,
  locale,
  isOpen,
  onToggleOpen,
  togglePending,
  onEditCategory,
  onToggleCategory,
  onDeleteCategory,
}: {
  category: MenuCategory;
  locale: string;
  isOpen: boolean;
  onToggleOpen: (id: string) => void;
  togglePending?: boolean;
  onEditCategory: (category: MenuCategory) => void;
  onToggleCategory: (categoryId: string, active: boolean) => void;
  onDeleteCategory: (categoryId: string) => void;
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

    const closeActionsOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenActionsCategoryId(null);
    };

    document.addEventListener('pointerdown', closeActionsOnOutsideClick);
    document.addEventListener('keydown', closeActionsOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeActionsOnOutsideClick);
      document.removeEventListener('keydown', closeActionsOnEscape);
    };
  }, [openActionsCategoryId]);

  return (
    <div
      className="group flex h-[52px] items-center justify-between gap-4 px-4 rounded-xl cursor-pointer select-none transition-all duration-150 active:scale-[0.99]"
      onClick={() => onToggleOpen(category.id)}
    >
      <div className="flex min-w-0 items-center gap-3">
        <GripVertical className="size-4 shrink-0 text-stone-300" />

        <h3 className="truncate text-sm font-bold text-stone-950">{textForLocale(category.name, locale)}</h3>

        <Badge tone={category.active ? 'green' : 'muted'}>
          {category.active ? t('active') : t('hidden')}
        </Badge>

        <span className="shrink-0 text-xs text-stone-500">
          {t('itemCount', { count: category.items.length })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* <button
          type="button"
          className={`relative h-5 w-10 rounded-full transition disabled:opacity-50 ${
            category.active ? 'bg-primary' : 'bg-stone-300'
          }`}
          onClick={(e) => {
            e.preventDefault();
            onToggleCategory(category.id, !category.active);
          }}
          aria-label={category.active ? t('active') : t('hidden')}
          disabled={togglePending}
        >
          <span
            className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${
              category.active ? 'left-5' : 'left-0.5'
            }`}
          />
        </button> */}

        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-full text-stone-400"
          aria-label={isOpen ? t('collapseCategory') : t('expandCategory')}
        >
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        <div
          data-category-actions-root
          className="relative overflow-visible"
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            className="flex size-10 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-50 hover:text-primary disabled:opacity-50"
            //  bg-white text-stone-600 '
            label={t('categoryActions')}
            aria-haspopup="menu"
            aria-expanded={openActionsCategoryId === category.id}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              setOpenActionsCategoryId((current) => (current === category.id ? null : category.id));
            }}
          >
            <MoreVertical className="size-4" />
          </IconButton>
          {openActionsCategoryId === category.id ? (
            <div role="menu" className="absolute end-0 top-10 z-50 w-52 rounded-2xl border border-border bg-white p-2 shadow-2xl">
              <button
                role="menuitem"
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
                role="menuitem"
                className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-start text-sm font-bold text-stone-700 transition hover:bg-stone-50 hover:text-primary"
                onClick={() => {
                  setOpenActionsCategoryId(null);
                  onToggleCategory(category.id, !category.active);
                }}
                disabled={togglePending}
              >
                {category.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {category.active ? t('deactivate') : t('activate')}
              </button>
              <button
                role="menuitem"
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
  );
}

export default MenuCategoryHeader;
