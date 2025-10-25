# Arquitectura funcional

Guía paso a paso (peras y manzanas) del flujo entre tu dashboard web, n8n y Google Sheets.

## 1. Panorama

```text
[Cliente web (HTML/JS)] --(GET)--> [n8n: webhook listar] --(Sheets API)--> [Google Sheets]
        |                                                ^
        '--(POST datos reserva)--> [n8n: webhook alta] --'
```

1. **Cliente web (HTML + CSS + JS nativo)**: carga el calendario, permite seleccionar fechas y envía
   los datos del formulario usando `fetch`.
2. **n8n**: recibe las solicitudes vía webhooks, valida la información, la guarda en Google Sheets y
   opcionalmente inicia flujos de pago o notificación.
3. **Google Sheets**: actúa como base de datos temporal, accesible para tu equipo sin código.

## 2. Flujos n8n sugeridos

### 2.1 Alta de reserva (`POST /webhook/reservas`)

1. Nodo **Webhook (Trigger)** recibe el payload JSON directamente desde la app.
2. Nodo **Function** valida campos obligatorios (nombre, email, teléfono, horario) y asegura que las
   horas estén dentro del rango permitido.
3. Nodo **Google Sheets** (`Append Sheet Row`) escribe una nueva fila con `eventDate`, `startTime`,
   `endTime`, `fullName`, `email`, `phone`, `notes`, `status`.
4. Nodo opcional **Stripe/Mercado Pago/Flow** crea un Payment Link y devuelve la URL para cobrar.
5. Nodo opcional **E-mail / WhatsApp** (SendGrid, Gmail, Twilio, etc.) envía confirmación al cliente y
   a tu equipo.
6. Nodo **Respond to Webhook** responde al front-end con `{ "ok": true, "paymentUrl": "..." }` si
   deseas mostrar un enlace de pago inmediato.

### 2.2 Listado de reservas (`GET /webhook/reservas/listar`)

1. Nodo **Webhook (Trigger)** acepta la solicitud `GET`.
2. Nodo **Google Sheets** (`Read Rows`) recupera las filas existentes.
3. Nodo **Function** transforma las filas en un arreglo JSON:
   ```json
   [
     {
       "id": "sheet-row-id",
       "eventDate": "2025-01-21",
       "startTime": "10:00",
       "endTime": "13:00",
       "fullName": "Carolina",
       "status": "confirmed",
       "notes": "Decoración arcoíris"
     }
   ]
   ```
4. Nodo **Respond to Webhook** envía el arreglo al navegador. Si la petición falla, el front-end usa
   los datos ficticios de `scripts/data/sampleBookings.js`.

## 3. Configuración clave en el repositorio

| Valor | Uso | Archivo |
|-------|-----|---------|
| `appConfig.listBookingsUrl` | Endpoint `GET` para obtener reservas. | `scripts/config.js` |
| `appConfig.createBookingUrl` | Endpoint `POST` para crear reservas. | `scripts/config.js` |
| `appConfig.googleSheetsUrl` | Referencia informativa a la hoja de cálculo. | `scripts/config.js` |
| `appConfig.businessHours` | Rango horario permitido para validaciones. | `scripts/config.js` |
| `sampleBookings` | Datos de respaldo si el webhook no responde. | `scripts/data/sampleBookings.js` |

## 4. Buenas prácticas de escalabilidad

- **Validación en ambos extremos**: replica las mismas reglas de horarios y campos obligatorios dentro
  de n8n para evitar registros corruptos.
- **Logs y alertas**: añade nodos de notificación (Slack, Discord, email) cuando haya errores al
  escribir en Sheets.
- **Pagos integrados**: aprovecha la respuesta del webhook de alta para devolver `paymentUrl` o
  `paymentIntentId` y así marcar la reserva como pagada al confirmar el webhook del gateway.
- **Migración futura**: cuando la demanda crezca puedes reemplazar Google Sheets por una base de datos
  (Supabase, PlanetScale, etc.). Solo tendrás que ajustar el workflow n8n y, si quieres, ampliar
  `bookingService.js` para consumir otro endpoint.

## 5. Estructura del front-end

```
.
├─ index.html             # Layout base con calendario, formulario y resumen de reservas.
├─ server.js              # Servidor estático opcional para entorno local.
├─ scripts/
│  ├─ main.js             # Inicialización y orquestación general.
│  ├─ calendar.js         # Renderizado de la grilla mensual y selección de días.
│  ├─ state.js            # Estado en memoria de reservas y fecha activa.
│  ├─ config.js           # Variables de configuración (webhook, horarios, locale).
│  ├─ services/
│  │   └─ bookingService.js  # GET/POST al webhook con fallback local.
│  ├─ utils/
│  │   └─ date.js         # Helpers para fechas.
│  └─ data/
│      └─ sampleBookings.js  # Datos de ejemplo.
└─ styles/
   └─ global.css          # Estilos principales y responsive.
```

Con esta guía podrás explicarle a tu equipo qué pieza modificar sin necesidad de revisar todo el
código fuente.
