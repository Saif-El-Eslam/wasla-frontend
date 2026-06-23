import { apiClient, toQueryString } from '../client';
import type {
  CreateVenueUserInput,
  ListQueryOptions,
  UpdateUserBranchesInput,
  UserListResponse,
  VenueUser,
} from '../types';

export const userService = {
  users: (options: ListQueryOptions = {}) =>
    apiClient<UserListResponse>(
      `/users${toQueryString({
        paginate: options.paginate,
        page: options.page,
        limit: options.limit,
        search: options.search,
      })}`,
    ),
  createUser: (input: CreateVenueUserInput) =>
    apiClient<{ user: VenueUser }>('/users', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateUserBranches: (userId: string, input: UpdateUserBranchesInput) =>
    apiClient<{ user: VenueUser }>(`/users/${userId}/branches`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
