import { test } from '@playwright/test';
import { FullBookingFlow } from './scenarios/FullBookingFlow.js';

test.setTimeout(180_000);

test('Seach book payment display', async ({ page }) => {
  const flow = new FullBookingFlow();
  await flow.run(page);
});
