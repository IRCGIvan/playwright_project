import { expect } from '@playwright/test';
import dotenv from 'dotenv';
import { sumarDias } from '../../helpers/utils.js';

dotenv.config();

export class HotelBookingFlow {
  /**
   * Ejecuta el flujo completo de booking
   * @param {import('@playwright/test').Page} page
   */

  async run(page) {
    await page.goto(process.env.BASE_URL);
    await page.getByRole('textbox', { name: 'Usuario:' }).fill('IvanC');
    await page.getByRole('textbox', { name: 'Empresa:' }).fill('netactica');
    await page.getByRole('textbox', { name: 'Contraseña:' }).fill('M4rc0P0l0$');
    await page.getByRole('button', { name: 'Ingresar' }).click();

    //widget de busqueda de producto
    await page.getByRole('button', { name: 'Crear Reserva' }).click();
    await page.getByRole('button', { name: 'Seguir sin registrar cliente' }).click();

    //espera por el widget
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Aéreos' })).toBeVisible({timeout: 120_000});

    //pestaña de hoteles
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Hoteles' }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Hoteles' })).toBeVisible({timeout: 120_000});

    //llena los datos de la busqueda
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCityDestinationSC').click();
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCityDestinationSC').pressSequentially('bogota', { delay: 120 });
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('listitem').filter({ hasText: 'Bogotá Bogotá, Distrito' }).click();
    const checkin = sumarDias(parseInt(process.env.PLUS_DAYS)).toString();
    const checkout = sumarDias(parseInt(process.env.PLUS_DAYS)+1).toString();
    console.log(checkin+'===================='+checkout);
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCheckIn').fill(checkin);
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_txtCheckOut').fill(checkout);
    
    //ejecutamos la busqueda
    const page1Promise = page.waitForEvent('popup');
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Hoteles' }).click();
    const page1 = await page1Promise;

    //esperamos los resultados (front de busqueda de hoteles)
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
    
    //detalle del hotel seleccionado
    const page2 = await page2Promise;
    await expect(page2.getByRole('button', { name: 'Reservar' }).nth(1)).toBeVisible({ timeout: 120_000 });
    await page2.getByRole('button', { name: 'Reservar' }).nth(1).click();

    //pagina de pasajeros
    await page2.locator('#first-name-adult-room-0-pax-0').click();
    await page2.locator('#first-name-adult-room-0-pax-0').fill('Ivan');
    await page2.locator('#last-name-adult-room-0-pax-0').click();
    await page2.locator('#last-name-adult-room-0-pax-0').fill('Caraza');
    await page2.locator('#document-numberadult-room-0-pax-0').click();
    await page2.locator('#document-numberadult-room-0-pax-0').fill('95902718');
    await page2.getByText('Mexico').click();
    await page2.locator('#nationality-adult-room-0-pax-0').getByRole('textbox').fill('arg');
    await page2.getByText('Argentina').click();
    await page2.locator('div').filter({ hasText: /^Día$/ }).nth(3).click();
    await page2.getByText('20', { exact: true }).click();
    await page2.locator('div').filter({ hasText: /^Mes$/ }).nth(3).click();
    await page2.getByText('Noviembre').click();
    await page2.locator('.mat-mdc-select-placeholder').click();
    await page2.getByText('1980').click();
    await page2.locator('#contact-email').click();
    await page2.locator('#contact-email').fill('ivan.caraza@testiando.co');
    await page2.locator('#contact-phone').click();
    await page2.locator('#contact-phone').fill('91126863150');
    await expect(page2.locator('#terms-check-input')).toBeVisible({ timeout: 120_000 });
    const checkbox = page2.locator('#terms-check-input');
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await page2.locator('#book-btn').click();
      
    //pagina de pagos
    await expect(page2.getByText('Espere por favor')).toBeVisible({ timeout: 120_000 });
    await expect(page2.getByText('Espere por favor')).toBeHidden({ timeout: 120_000 });

    await expect(page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_btnApplyExpenses')).toBeVisible({ timeout: 120_000 });

    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_liCash input[name="fop"]').check();
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_ddlGender').selectOption('2');
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_ddlProvinces').selectOption('ARC');
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_ddlCities').selectOption('BUE');
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtStreet').click();
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtStreet').fill('vanazuela');
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtStreetNumber').click();
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtStreetNumber').fill('1970');
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtNeighborhood').click();
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtNeighborhood').fill('balvanera');
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtPostCode').click();
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_shopperPaymentInfoControl_txtPostCode').fill('1096');
    
    //esperamos por el boton de pagos
    await page2.locator('#ctl00_ctl00_NetSiteContentPlaceHolder_NetFulfillmentContentPlaceHolder_btnPaymentMethodCash').click();

    //esperamos por el boton de direccion al display despues del pago
    await expect(page2.getByText('Por favor, espere un momento')).toBeVisible({ timeout: 120_000 });
    await expect(page2.getByText('Por favor, espere un momento')).toBeHidden({ timeout: 120_000 });

    await expect(page2.getByText('Espere un momento, estamos procesando su pago')).toBeVisible({ timeout: 120_000 });
    await expect(page2.getByText('Espere un momento, estamos procesando su pago')).toBeHidden({ timeout: 120_000 });

    await page2.getByRole('button', { name: 'Ver tu itinerario' }).click();
    await expect(page2.getByText('Precio Total del Itinerario')).toBeVisible({ timeout: 120_000 });
    await expect(page2.getByText('Tarifas Base del Itinerario')).toBeVisible({ timeout: 120_000 });
  }
}

