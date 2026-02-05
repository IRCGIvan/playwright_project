import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export class SearchWidget {
  /**
   * Ejecuta el flujo completo de booking
   * @param {import('@playwright/test').Page} page
   */

  async run(page) {
    await page.goto(process.env.BASE_URL);

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
  }
}

