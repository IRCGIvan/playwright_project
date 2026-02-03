import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://preprod.netactica.com/NetAdmin/Login.aspx');
  
  await page.getByRole('textbox', { name: 'Usuario:' }).fill('IvanC');
  await page.getByRole('textbox', { name: 'Empresa:' }).fill('netactica');
  await page.getByRole('textbox', { name: 'Contraseña:' }).fill('M4rc0P0l0$');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await page.getByRole('button', { name: 'Crear Reserva' }).click();
  await page.getByRole('button', { name: 'Seguir sin registrar cliente' }).click();

  await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Aéreos' })).toBeVisible({timeout: 120_000});

  await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Hoteles' }).click();
  await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Hoteles' })).toBeVisible({timeout: 120_000});

  await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCityDestinationSC').click();
  await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCityDestinationSC').pressSequentially('bogota', { delay: 120 });
  await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('listitem').filter({ hasText: 'Bogotá Bogotá, Distrito' }).click();
    
  await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCheckIn').fill('05-03-2026');
  await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCheckOut').fill('06-03-2026');

  // await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCheckIn').click();
  // await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: '16' }).click();
  // await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCheckOut').click();
  // await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: '17' }).click();
  // await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtNights').fill('1');
  
  const page1Promise = page.waitForEvent('popup');
  await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Hoteles' }).click();
  const page1 = await page1Promise;

  let firstLink = page1
  .locator('hotel-result .hotel-item__card a')
  .first();
  await expect(firstLink).toBeVisible({timeout: 120_000});

  await page1.getByRole('checkbox', { name: 'Cancelación flexible' }).check();
  // await page2.waitForLoadState('networkidle');
  firstLink = page1
  .locator('hotel-result .hotel-item__card a')
  .first();
  await expect(firstLink).toBeVisible({timeout: 120_000});
  const page2Promise = page1.waitForEvent('popup');
  await firstLink.click();
  
  const page2 = await page2Promise;
  
  await expect(page2.getByRole('button', { name: 'Reservar' }).nth(1)).toBeVisible({ timeout: 120_000 });

});