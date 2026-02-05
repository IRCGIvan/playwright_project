import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export class DisplayReservation {
  /**
   * Ejecuta el flujo completo de booking
   * @param {import('@playwright/test').Page} page
   */

  async run(page) {
    console.log(`${process.env.BASE_URL_NFF}?userService=${process.env.USSV}&TravelItineraryId=${process.env.ITIN}&ReservationsToPay=False&SessionToken=${process.env.TOKEN}`);
    await page.goto(`${process.env.BASE_URL_NFF}?userService=${process.env.USSV}&TravelItineraryId=${process.env.ITIN}&ReservationsToPay=False&SessionToken=${process.env.TOKEN}`);
    await expect(page.getByText('N° de Itinerario:')).toBeVisible({timeout: 120_000});
  }
}






