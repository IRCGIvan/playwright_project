import { test } from '@playwright/test';
import { HotelBookingFlow } from './scenarios/HotelBooking.js';

test.setTimeout(180_000);

test('Hotel Seach book payment display', async ({ page }) => {
  const flow = new HotelBookingFlow();
  await flow.run(page);
});
