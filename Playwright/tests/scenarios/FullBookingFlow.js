import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export class FullBookingFlow {
  /**
   * Ejecuta el flujo completo de booking
   * @param {import('@playwright/test').Page} page
   */

  async run(page) {
    const itineraryId = process.env.ITINERARY_ID;
    //render la busqueda y seleccion del hotel
    await page.goto(process.env.BASE_URL+itineraryId);
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('checkbox', { name: 'Cancelación flexible' }).check();
    await expect(page.locator('#hotelcode-P-Expedia-19684404').getByText('Cancelación flexible')).toBeVisible({timeout: 120_000});
    await expect(page.locator('#hotelcode-P-Expedia-19684404 a')).toBeVisible({ timeout: 120_000 });
    await page.locator('#hotelcode-P-Expedia-19684404 a').click();

    //detalle del hotel
    const page1 = await page1Promise;
    await expect(page1.getByRole('button', { name: 'Reservar' }).nth(1)).toBeVisible({ timeout: 120_000 });
    await page1.getByRole('button', { name: 'Reservar' }).nth(1).click();

    //pagina de pasajeros
    await page1.locator('#first-name-adult-room-0-pax-0').click();
    await page1.locator('#first-name-adult-room-0-pax-0').fill('Ivan');
    await page1.locator('#last-name-adult-room-0-pax-0').click();
    await page1.locator('#last-name-adult-room-0-pax-0').fill('Caraza');
    await page1.locator('#document-numberadult-room-0-pax-0').click();
    await page1.locator('#document-numberadult-room-0-pax-0').fill('95902718');
    await page1.getByText('Mexico').click();
    await page1.locator('#nationality-adult-room-0-pax-0').getByRole('textbox').fill('arg');
    await page1.getByText('Argentina').click();
    await page1.locator('div').filter({ hasText: /^Día$/ }).nth(3).click();
    await page1.getByText('20', { exact: true }).click();
    await page1.locator('div').filter({ hasText: /^Mes$/ }).nth(3).click();
    await page1.getByText('Noviembre').click();
    await page1.locator('.mat-mdc-select-placeholder').click();
    await page1.getByText('1980').click();
    await page1.locator('#contact-email').click();
    await page1.locator('#contact-email').fill('ivan.caraza@testiando.co');
    await page1.locator('#contact-phone').click();
    await page1.locator('#contact-phone').fill('91126863150');
    await expect(page1.locator('#terms-check-input')).toBeVisible({ timeout: 120_000 });
    const checkbox = page1.locator('#terms-check-input');
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await page1.locator('#book-btn').click();
    
    //pagina de pagos
    await expect(page1.getByText('Espere por favor')).toBeVisible({ timeout: 120_000 });
    await expect(page1.getByText('Espere por favor')).toBeHidden({ timeout: 120_000 });

    await expect(page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_btnApplyExpenses')).toBeVisible({ timeout: 120_000 });

    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_liCash input[name="fop"]').check();
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_ddlGender').selectOption('2');
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_ddlProvinces').selectOption('ARC');
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_ddlCities').selectOption('BUE');
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtStreet').click();
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtStreet').fill('vanazuela');
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtStreetNumber').click();
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtStreetNumber').fill('1970');
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtNeighborhood').click();
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtNeighborhood').fill('balvanera');
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtPostCode').click();
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtPostCode').fill('1096');
    
    //esperamos por el boton de pagos
    await page1.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_btnPaymentMethodCash').click();

    //esperamos por el boton de direccion al display despues del pago
    await expect(page1.getByText('Por favor, espere un momento')).toBeVisible({ timeout: 120_000 });
    await expect(page1.getByText('Por favor, espere un momento')).toBeHidden({ timeout: 120_000 });

    await expect(page1.getByText('Espere un momento, estamos procesando su pago')).toBeVisible({ timeout: 120_000 });
    await expect(page1.getByText('Espere un momento, estamos procesando su pago')).toBeHidden({ timeout: 120_000 });

    await page1.getByRole('button', { name: 'Ver tu itinerario' }).click();
    await expect(page1.getByText('Precio Total del Itinerario')).toBeVisible({ timeout: 120_000 });
    await expect(page1.getByText('Tarifas Base del Itinerario')).toBeVisible({ timeout: 120_000 });
  }
}

