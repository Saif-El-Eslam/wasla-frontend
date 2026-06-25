import type { QueryClient } from '@tanstack/react-query';
import type { Menu, MenuCategory, MenuItem } from '@/lib/api';
import { queryKeys } from '@/lib/api/query-keys';

function updateMenuCache(queryClient: QueryClient, branchId: string, updater: (menu: Menu) => Menu) {
  if (!branchId) return;
  queryClient.setQueriesData<Menu | null>({ queryKey: queryKeys.branchMenu(branchId) }, (current) => {
    if (!current) return current;
    if (!Array.isArray(current.categories)) return current;

    return updater(current);
  });
}

export function replaceCachedMenu(queryClient: QueryClient, branchId: string, menu: Menu) {
  if (!branchId) {
    return;
  }

  queryClient.setQueriesData<Menu | null>({ queryKey: queryKeys.branchMenu(branchId) }, () => menu);
}

export function setCachedMenuPublishedAt(
  queryClient: QueryClient,
  branchId: string,
  publishedAt: string | null,
) {
  updateMenuCache(queryClient, branchId, (current) => ({
    ...current,
    publishedAt,
  }));
}

export function addCachedCategory(queryClient: QueryClient, branchId: string, category: MenuCategory) {
  updateMenuCache(queryClient, branchId, (current) => ({
    ...current,
    categories: current.categories.some((item) => item.id === category.id)
      ? current.categories.map((item) => (item.id === category.id ? category : item))
      : [...current.categories, category],
  }));
}

export function replaceCachedCategory(
  queryClient: QueryClient,
  branchId: string,
  categoryId: string,
  category: Partial<MenuCategory>,
) {
  updateMenuCache(queryClient, branchId, (current) => ({
    ...current,
    categories: current.categories.map((item) => (item.id === categoryId ? { ...item, ...category } : item)),
  }));
}

export function removeCachedCategory(queryClient: QueryClient, branchId: string, categoryId: string) {
  updateMenuCache(queryClient, branchId, (current) => ({
    ...current,
    categories: current.categories.filter((category) => category.id !== categoryId),
  }));
}

export function addCachedItem(
  queryClient: QueryClient,
  branchId: string,
  categoryId: string,
  item: MenuItem,
) {
  updateMenuCache(queryClient, branchId, (current) => ({
    ...current,
    categories: current.categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            items: category.items.some((currentItem) => currentItem.id === item.id)
              ? category.items.map((currentItem) => (currentItem.id === item.id ? item : currentItem))
              : [...category.items, item],
          }
        : category,
    ),
  }));
}

export function replaceCachedItem(
  queryClient: QueryClient,
  branchId: string,
  categoryId: string,
  itemId: string,
  item: Partial<MenuItem>,
) {
  updateMenuCache(queryClient, branchId, (current) => {
    return {
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((currentItem) =>
                currentItem.id === itemId ? { ...currentItem, ...item } : currentItem,
              ),
            }
          : category,
      ),
    };
  });
}

export function removeCachedItem(
  queryClient: QueryClient,
  branchId: string,
  categoryId: string,
  itemId: string,
) {
  updateMenuCache(queryClient, branchId, (current) => ({
    ...current,
    categories: current.categories.map((category) =>
      category.id === categoryId
        ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
        : category,
    ),
  }));
}
