import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export class SearchWidget {
  /**
   * Ejecuta el flujo completo de booking
   * @param {import('@playwright/test').Page} page
   */

  async run(page) {
    await page.goto('https://preprod.netactica.com/NetAdmin/Login.aspx');    

    //login en netadmin
    await page.getByRole('textbox', { name: 'Usuario:' }).fill(process.env.USER);
    await page.getByRole('textbox', { name: 'Empresa:' }).fill(process.env.USSV);
    await page.getByRole('textbox', { name: 'Contraseña:' }).fill(process.env.PASS);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    //crear reserva
    await page.getByRole('button', { name: 'Crear Reserva' }).click();
    await page.getByRole('button', { name: 'Seguir sin registrar cliente' }).click();

    //tabs del widget
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Aéreos' })).toBeVisible({timeout: 120_000});
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Aéreos' }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Aéreos' })).toBeVisible({timeout: 120_000});
    
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Hoteles' }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Hoteles' })).toBeVisible({timeout: 120_000});
    
    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Aéreo + Hotel' }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Aéreo + Hotel' })).toBeVisible({timeout: 120_000});

    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Bus + Hotel' }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Bus + Hotel' })).toBeVisible({timeout: 120_000});

    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Bus', exact: true }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Bus' })).toBeVisible({timeout: 120_000});

    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Extras' }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Extras' })).toBeVisible({timeout: 120_000});

    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Autos', exact: true }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Autos' })).toBeVisible({timeout: 120_000});

    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Aéreo + Autos' }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar Aéreo + Autos' })).toBeVisible({timeout: 120_000});

    await page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('link', { name: 'Asistencias' }).click();
    await expect(page.locator('#iframeTab_0').contentFrame().locator('#ctl00_FlowIFrame').contentFrame().getByRole('button', { name: 'Buscar' })).toBeVisible({timeout: 120_000});
  }
}

