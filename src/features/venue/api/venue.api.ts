import { apiClient } from '@/lib/api/axios';
import type { SetupVenueInput, UpdateVenueInput, Venue } from '@/lib/api/types';

export const venueService = {
  myVenue: () => apiClient<{ venue: Venue }>('/venue/me').then((data) => data.venue),
  setupVenue: (input: SetupVenueInput) =>
    apiClient<{ venue: Venue }>('/venue/dashboard/setup', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateVenue: (input: UpdateVenueInput) =>
    apiClient<{ venue: Venue }>('/venue/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
