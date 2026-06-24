import { apiClient } from '@/lib/api/axios';
import type { CurrentUser, UpdateMeInput, UpdatePasswordInput } from '@/lib/api/types';

export const authService = {
  register: (input: { name: string; phone: string; password: string }) =>
    apiClient<{ user: CurrentUser; devOtp?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: { phone: string; password: string }) =>
    apiClient<{ user: CurrentUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  verifyOtp: (input: { phone: string; code: string }) =>
    apiClient<{ user: CurrentUser }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  logout: () =>
    apiClient<{ loggedOut: boolean }>('/auth/logout', {
      method: 'POST',
    }),
  me: () => apiClient<{ user: CurrentUser }>('/auth/me').then((data) => data.user),
  updateMe: (input: UpdateMeInput) =>
    apiClient<{ user: CurrentUser }>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  updatePassword: (input: UpdatePasswordInput) =>
    apiClient<{ user: CurrentUser }>('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
