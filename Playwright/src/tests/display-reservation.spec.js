import { test } from '@playwright/test';
import { DisplayReservation } from './scenarios/DisplayReservation.js';

test.setTimeout(180_000);

test('Display reservation', async ({ page }) => {
  const flow = new DisplayReservation();
  await flow.run(page);
});
