import { test } from '@playwright/test';
import { ReservationSummary } from './scenarios/ReservationSummary.js';

test.setTimeout(180_000);

test('Reservation summary', async ({ page }) => {
  const flow = new ReservationSummary();
  await flow.run(page);
});
