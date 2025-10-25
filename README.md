# Birthday Hub (birthdayApp-DS)

Dashboard liviano y totalmente estático para gestionar reservas de cumpleaños en tu local. Está
pensado para funcionar aun cuando no puedas instalar dependencias externas: basta con tener Node.js
para servir los archivos o incluso abrir `index.html` directamente en tu navegador.

> "Hecho con peras y manzanas": cada módulo viene con nombres descriptivos y comentarios básicos
> para que puedas adaptarlo rápido, ya sea integrándolo con n8n, Google Sheets o un gateway de pago.

## 🧱 Arquitectura general

| Capa | Descripción | Archivos clave |
|------|-------------|----------------|
| **Interfaz web (HTML + CSS + JS)** | Renderiza calendario, formulario y resumen de reservas sin frameworks. | `index.html`, `styles/global.css`, `scripts/*.js` |
| **Servicios** | Gestionan las llamadas al webhook (n8n) y cargan datos de respaldo. | `scripts/services/bookingService.js` |
| **Estado** | Mantiene la selección actual y el listado de reservas. | `scripts/state.js` |
| **Utilidades** | Generan matrices del calendario y formatean fechas. | `scripts/utils/date.js` |
| **Documentación** | Plano completo y guía de pagos. | `docs/ARCHITECTURE.md`, `docs/PAYMENT_INTEGRATION.md` |

## 🚀 Cómo ejecutarlo

1. **Inicia el servidor estático incluido**
   ```bash
   npm run dev
   ```
   Esto lanza `server.js`, un pequeño servidor HTTP que entrega los archivos desde la raíz del
   proyecto en `http://localhost:4173`.

   > Si prefieres no usar Node.js, puedes abrir directamente `index.html` en tu navegador. Algunas
   > funciones como las peticiones `fetch` al webhook se desactivarán por políticas de CORS cuando
   > se abre como archivo local.

2. **Configura tus endpoints** en `scripts/config.js`:
   ```js
   export const appConfig = {
     listBookingsUrl: 'https://tu-instancia.n8n.cloud/webhook/birthday-reservations/listar',
     createBookingUrl: 'https://tu-instancia.n8n.cloud/webhook/birthday-reservations',
     googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/tu-hoja',
     locale: 'es-ES',
     timeZone: 'America/Santiago',
     businessHours: { start: '09:00', end: '22:00' }
   };
   ```
   - `listBookingsUrl`: endpoint `GET` que devuelve las reservas existentes.
   - `createBookingUrl`: endpoint `POST` que registra una nueva reserva.
   - `googleSheetsUrl`: referencia para tu equipo (no se muestra directamente en la UI).

3. **Integra con n8n** configurando las dos rutas anteriores.

## 🧭 Flujo de uso

1. El usuario abre la app y ve el calendario del mes actual con estados de color.
2. Al tocar un día disponible, se muestra el formulario para ingresar datos de contacto y horario.
3. Al enviar, la app valida rangos (09:00 – 22:00) y ejecuta un `POST` al webhook configurado.
4. El webhook en n8n guarda la información en Google Sheets y opcionalmente responde con el estado.
5. La UI actualiza la lista de "Reservas recientes" y el estado del calendario sin recargar la página.

## 📁 Módulos principales

- `scripts/main.js`: orquesta la inicialización, renderiza el calendario y conecta el formulario.
- `scripts/calendar.js`: crea la cuadrícula mensual, pinta estados y gestiona la selección de días.
- `scripts/state.js`: mantiene en memoria los bookings y la fecha seleccionada.
- `scripts/services/bookingService.js`: encapsula las llamadas `fetch` al webhook con fallback local.
- `scripts/data/sampleBookings.js`: datos ficticios usados mientras no exista backend.

Todos los módulos son ES Modules nativos para que el navegador pueda importarlos sin bundlers.

## 🧪 Pruebas manuales sugeridas

- Seleccionar un día libre y enviar la reserva (deberías ver la alerta de confirmación).
- Probar horarios fuera de rango o invertir inicio/fin para verificar los mensajes de error.
- Desconectar temporalmente la URL del webhook para comprobar que se usan los datos locales.
- Cambiar de mes con los botones ◀ ▶ y asegurar que las selecciones previas se limpian.

## 💳 Próximos pasos: activar cobros

En `docs/PAYMENT_INTEGRATION.md` encontrarás un resumen de Stripe, Mercado Pago, Polar y Flow, y cómo
conectarlos a n8n para cobrar al mismo tiempo que registras la reserva. Recomendación rápida:

1. Genera un Payment Link o Checkout Session en tu workflow n8n.
2. Devuelve la URL de pago al front-end para mostrarla en un mensaje de confirmación o enviarla por
   correo/SMS.
3. Actualiza Google Sheets cuando n8n reciba el webhook de confirmación de pago.

---
¿Necesitas ayuda para desplegarlo o automatizar recordatorios? Abre un issue y seguimos con peras y
manzanas.
