import { apiClient } from '@/lib/api/axios';
import type { SetupVenueInput, Venue } from '@/lib/api/types';

export const venueService = {
  myVenue: () => apiClient<{ venue: Venue }>('/venue/me').then((data) => data.venue),
  setupVenue: (input: SetupVenueInput) =>
    apiClient<{ venue: Venue }>('/venue/dashboard/setup', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
