import { test } from '@playwright/test';
import { SearchWidget } from './scenarios/SearchWidget.js';

test.setTimeout(180_000);

test('Search widget', async ({ page }) => {
  const flow = new SearchWidget();
  await flow.run(page);
});
