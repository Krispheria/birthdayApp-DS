import { appConfig } from '../config.js';
import { sampleBookings } from '../data/sampleBookings.js';

const HEADERS = { 'Content-Type': 'application/json' };

export async function fetchExistingBookings() {
  if (!appConfig.listBookingsUrl) {
    return sampleBookings;
  }

  try {
    const response = await fetch(appConfig.listBookingsUrl, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('No se pudo recuperar la información remota');
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }

    return data?.bookings ?? sampleBookings;
  } catch (error) {
    console.warn('[bookingService] Usando datos locales por error:', error.message);
    return sampleBookings;
  }
}

export async function submitBooking(payload) {
  if (!appConfig.createBookingUrl) {
    console.info('[bookingService] Webhook no configurado. Payload:', payload);
    return { ok: true, data: payload };
  }

  try {
    const response = await fetch(appConfig.createBookingUrl, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || 'Error al enviar la reserva');
    }

    return {
      ok: true,
      data: await response.json().catch(() => ({}))
    };
  } catch (error) {
    console.error('[bookingService] Error al enviar la reserva:', error);
    return {
      ok: false,
      error: error.message
    };
  }
}
