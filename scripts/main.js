import { appConfig } from './config.js';
import { renderCalendar, attachCalendarControls, handleDaySelection } from './calendar.js';
import { fetchExistingBookings, submitBooking } from './services/bookingService.js';
import { addBooking, getBookings, setBookings, setMonthReference, setSelectedDate } from './state.js';
import { createMonthReference, formatLongDate } from './utils/date.js';

const calendarTitle = document.getElementById('calendarTitle');
const calendarContainer = document.getElementById('calendarGrid');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const bookingForm = document.getElementById('bookingForm');
const selectionHint = document.getElementById('selectionHint');
const bookingList = document.getElementById('bookingList');
const cancelButton = document.getElementById('cancelSelection');
const hiddenDateInput = bookingForm.querySelector('input[name="eventDate"]');

function refreshCalendar() {
  renderCalendar(calendarContainer, calendarTitle);
}

function renderBookingsList() {
  const bookings = getBookings();
  bookingList.innerHTML = '';

  if (!bookings.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Aún no hay reservas registradas.';
    bookingList.appendChild(empty);
    return;
  }

  bookings.slice(0, 6).forEach((booking) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${formatLongDate(new Date(booking.eventDate))}</strong>
      <span>${booking.fullName}</span>
      <small>${booking.startTime} - ${booking.endTime} · ${booking.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}</small>
    `;
    bookingList.appendChild(item);
  });
}

function resetForm() {
  bookingForm.reset();
  hiddenDateInput.value = '';
  bookingForm.hidden = true;
  selectionHint.hidden = false;
  setSelectedDate(null);
  calendarContainer
    .querySelectorAll('.calendar-cell.selected')
    .forEach((cell) => cell.classList.remove('selected'));
}

function showForm(date) {
  selectionHint.hidden = true;
  bookingForm.hidden = false;
  hiddenDateInput.value = date;
}

function validateTimes(startTime, endTime) {
  const start = startTime.split(':').map(Number);
  const end = endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];

  if (endMinutes <= startMinutes) {
    return 'La hora de término debe ser posterior a la de inicio';
  }

  const [startHourLimit, startMinuteLimit] = appConfig.businessHours.start.split(':').map(Number);
  const [endHourLimit, endMinuteLimit] = appConfig.businessHours.end.split(':').map(Number);
  const startLimit = startHourLimit * 60 + startMinuteLimit;
  const endLimit = endHourLimit * 60 + endMinuteLimit;

  if (startMinutes < startLimit || endMinutes > endLimit) {
    return `El evento debe mantenerse entre las ${appConfig.businessHours.start} y las ${appConfig.businessHours.end} hrs`;
  }

  return null;
}

async function initialize() {
  const baseMonth = createMonthReference(appConfig.initialMonthOffset);
  setMonthReference(baseMonth);

  const bookings = await fetchExistingBookings();
  setBookings(bookings);

  refreshCalendar();
  renderBookingsList();

  attachCalendarControls(prevMonthButton, nextMonthButton, () => {
    refreshCalendar();
    resetForm();
  });

  handleDaySelection(calendarContainer, handleDateSelected);

  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());

    const error = validateTimes(payload.startTime, payload.endTime);
    if (error) {
      alert(error);
      return;
    }

    payload.status = 'pending';
    payload.createdAt = new Date().toISOString();

    const response = await submitBooking(payload);
    if (!response.ok) {
      alert(`No se pudo registrar la reserva: ${response.error}`);
      return;
    }

    addBooking(payload);
    renderBookingsList();
    refreshCalendar();
    resetForm();

    alert('¡Reserva enviada! Te contactaremos para confirmar el pago.');
  });

  cancelButton.addEventListener('click', () => {
    resetForm();
  });
}

function handleDateSelected(dateKey) {
  if (!dateKey) {
    resetForm();
    return;
  }

  showForm(dateKey);
}

initialize().catch((error) => {
  console.error('Error inicializando la aplicación', error);
  selectionHint.textContent = 'No pudimos cargar el calendario. Reintenta en unos segundos.';
});
