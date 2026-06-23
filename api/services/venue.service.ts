import { apiClient } from '../client';
import type { SetupVenueInput, Venue } from '../types';

export const venueService = {
  myVenue: () => apiClient<{ venue: Venue }>('/venue/me').then((data) => data.venue),
  setupVenue: (input: SetupVenueInput) =>
    apiClient<{ venue: Venue }>('/venue/setup', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
