# Guía para cobrar reservas desde la app

Esta guía resume, paso a paso, cómo habilitar pagos en línea reutilizando n8n como backend. El
objetivo es que la persona pueda reservar y pagar en un mismo flujo.

## 1. Opciones recomendadas

| Plataforma | Ventajas | Notas de integración |
|------------|----------|----------------------|
| **Stripe Payment Links** | Enlaces de pago listos, soporte global, Apple Pay / Google Pay. | Necesita cuenta verificada. n8n tiene nodo oficial. |
| **Mercado Pago** | Ideal para LATAM, cuotas locales. | Usa node HTTP Request en n8n con credenciales. |
| **Flow (Chile)** | Transferencias y tarjetas locales. | API REST simple, docs en español. |
| **Polar (Chile)** | Pagos rápidos via links. | API beta, consultar documentación privada. |

> Consejo: comienza con **Stripe Payment Links** si necesitas algo rápido y con experiencia
> internacional; usa **Flow** o **Mercado Pago** si tus clientes son principalmente chilenos.

## 2. Estrategia técnica

1. **Webhook de reserva (n8n)** recibe los datos enviados por el front-end.
2. Después de guardar la reserva en Google Sheets, agrega un nodo que cree el enlace de pago en la
   plataforma elegida.
3. Envía la URL de pago en la respuesta del webhook y también por correo / WhatsApp.
4. El front-end puede mostrar el enlace devuelto al usuario para que pague inmediatamente.

## 3. Ejemplo con Stripe

1. Crea un **Stripe Product** llamado "Reserva cumpleaños" con precio fijo o variable.
2. En n8n, añade un nodo **Stripe > Payment Link** con los datos:
   - `price` (ID del precio creado)
   - `quantity = 1`
   - `after_completion` configurado como `redirect` hacia una página de agradecimiento.
3. La respuesta del nodo contiene `url`; guárdala en Google Sheets junto a la reserva.
4. Devuelve un JSON al front-end:
   ```json
   {
     "status": "ok",
     "paymentUrl": "https://buy.stripe.com/..."
   }
   ```
5. En el front-end, muestra un botón "Pagar ahora" con ese link y registra en analytics si la persona
   lo presiona.

## 4. Validación del pago

- Configura un **webhook de Stripe/Mercado Pago** que avise a n8n cuando el pago se complete.
- El workflow debe actualizar la fila correspondiente en Google Sheets (columna `status = paid`).
- Opcional: envía un correo de confirmación automática al cliente y una notificación interna.

## 5. Experiencia de usuario

- Muestra en el formulario un aviso claro: "Tu reserva queda pendiente hasta que se acredite el pago".
- Una vez que n8n confirme el pago, podrías enviar un correo con información logística (horarios de
  llegada, lista de invitados, etc.).
- Para pagos parciales, agrega campos adicionales en el formulario (`montoReserva`, `saldoRestante`).

## 6. Próximos pasos

1. Documenta en este repositorio los workflows finales (`docs/workflows/*.json`).
2. Añade pruebas automáticas en n8n para validar que la creación de enlaces de pago no falle.
3. Integra herramientas anti-fraude (3D Secure, validación de correo) si el volumen crece.

Con esta guía, tienes un camino claro para monetizar las reservas sin abandonar el ecosistema n8n +
Google Sheets.
