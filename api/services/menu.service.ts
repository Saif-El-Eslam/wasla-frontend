import { apiClient } from '../client';
import type {
  CreateCategoryInput,
  CreateItemInput,
  CreateMenuInput,
  Menu,
  UpdateCategoryInput,
  UpdateItemInput,
  UpdateMenuInput,
} from '../types';

export const menuService = {
  branchMenu: (branchId: string) =>
    apiClient<{ menu: Menu | null }>(`/branches/${branchId}/menu`).then((data) => data.menu),
  createBranchMenu: (branchId: string, input: CreateMenuInput) =>
    apiClient<{ menu: Menu }>(`/branches/${branchId}/menu`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateBranchMenu: (branchId: string, input: UpdateMenuInput) =>
    apiClient<{ menu: Menu }>(`/branches/${branchId}/menu`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  publishBranchMenu: (branchId: string) =>
    apiClient<{ menu: Menu }>(`/branches/${branchId}/menu/publish`, {
      method: 'POST',
    }),
  unpublishBranchMenu: (branchId: string) =>
    apiClient<{ menu: Menu }>(`/branches/${branchId}/menu/unpublish`, {
      method: 'POST',
    }),
  createCategory: (branchId: string, input: CreateCategoryInput) =>
    apiClient<{ category: Menu['categories'][number] }>(`/branches/${branchId}/menu/categories`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateCategory: (branchId: string, categoryId: string, input: UpdateCategoryInput) =>
    apiClient<{ category: Menu['categories'][number] }>(
      `/branches/${branchId}/menu/categories/${categoryId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    ),
  deleteCategory: (branchId: string, categoryId: string) =>
    apiClient<{ deleted: boolean }>(`/branches/${branchId}/menu/categories/${categoryId}`, {
      method: 'DELETE',
    }),
  reorderCategories: (branchId: string, categoryIds: string[]) =>
    apiClient<{ menu: Menu }>(`/branches/${branchId}/menu/categories/reorder`, {
      method: 'POST',
      body: JSON.stringify({ categoryIds }),
    }),
  createItem: (branchId: string, categoryId: string, input: CreateItemInput) =>
    apiClient<{ item: Menu['categories'][number]['items'][number] }>(
      `/branches/${branchId}/menu/categories/${categoryId}/items`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
    ),
  updateItem: (branchId: string, categoryId: string, itemId: string, input: UpdateItemInput) =>
    apiClient<{ item: Menu['categories'][number]['items'][number] }>(
      `/branches/${branchId}/menu/categories/${categoryId}/items/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    ),
  deleteItem: (branchId: string, categoryId: string, itemId: string) =>
    apiClient<{ deleted: boolean }>(`/branches/${branchId}/menu/categories/${categoryId}/items/${itemId}`, {
      method: 'DELETE',
    }),
  reorderItems: (branchId: string, categoryId: string, itemIds: string[]) =>
    apiClient<{ menu: Menu }>(`/branches/${branchId}/menu/categories/${categoryId}/items/reorder`, {
      method: 'POST',
      body: JSON.stringify({ itemIds }),
    }),
  toggleItemAvailability: (branchId: string, categoryId: string, itemId: string, available?: boolean) =>
    apiClient<{ item: Menu['categories'][number]['items'][number] }>(
      `/branches/${branchId}/menu/categories/${categoryId}/items/${itemId}/toggle-availability`,
      {
        method: 'POST',
        body: JSON.stringify({ available }),
      },
    ),
};
