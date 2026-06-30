import type { CurrentUser } from '@/lib/api';

export function postAuthDestination(user: Pick<CurrentUser, 'role' | 'venueId'>, locale: string) {
  if (user.role === 'SUPER_ADMIN') {
    return `/${locale}/admin`;
  }

  return user.venueId ? `/${locale}/dashboard` : `/${locale}/dashboard/setup`;
}
