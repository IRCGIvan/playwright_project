import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export class DisplayReservation {
  /**
   * Ejecuta el flujo completo de booking
   * @param {import('@playwright/test').Page} page
   */

  async run(page) {
    await page.goto(`https://preprod.netactica.com/NetFulfillment/Login.aspx?userService=${process.env.USSV}&TravelItineraryId=${process.env.ITIN}&ReservationsToPay=True&SessionToken=${process.env.TOKEN}`);
    await expect(page.getByText('Elija la forma de pago de su')).toBeVisible({timeout: 120_000});
    await page.getByRole('link', { name: 'Vea más detalles de su' }).click();
    await expect(page.getByText('Tarifas Base del Itinerario')).toBeVisible({timeout: 120_000});
    await expect(page.getByText('Total a pagar')).toBeVisible({timeout: 120_000});
  }
}






