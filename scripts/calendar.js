import { formatMonthTitle, getMonthMatrix, formatDateKey, isPastDay, shiftMonth } from './utils/date.js';
import { getDayStatusMap, getMonthReference, setMonthReference, setSelectedDate } from './state.js';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function renderCalendar(container, titleElement) {
  const month = getMonthReference();
  titleElement.textContent = formatMonthTitle(month);

  container.innerHTML = '';

  const headerRow = document.createElement('div');
  headerRow.className = 'calendar-grid weekdays';
  WEEKDAYS.forEach((day) => {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell weekday';
    cell.textContent = day;
    cell.setAttribute('role', 'columnheader');
    headerRow.appendChild(cell);
  });

  const grid = document.createElement('div');
  grid.className = 'calendar-grid';
  grid.setAttribute('role', 'rowgroup');

  const matrix = getMonthMatrix(month);
  const statusMap = getDayStatusMap();

  matrix.forEach((date) => {
    const cell = document.createElement('button');
    cell.className = 'calendar-cell';
    cell.setAttribute('role', 'gridcell');

    if (!date) {
      cell.disabled = true;
      cell.classList.add('disabled');
      grid.appendChild(cell);
      return;
    }

    const dateKey = formatDateKey(date);
    cell.dataset.date = dateKey;
    cell.innerHTML = `<span class="date-number">${date.getDate()}</span>`;

    const isPast = isPastDay(date);
    if (isPast) {
      cell.disabled = true;
      cell.classList.add('disabled');
    }

    const bookings = statusMap[dateKey] || [];

    if (bookings.length) {
      const confirmed = bookings.some((b) => b.status === 'confirmed');
      const pending = bookings.some((b) => b.status === 'pending');
      const status = confirmed ? 'confirmed' : pending ? 'pending' : 'available';

      const chip = document.createElement('span');
      chip.className = `status-chip ${status}`;
      chip.textContent =
        status === 'confirmed'
          ? 'Reservado'
          : status === 'pending'
          ? 'Pendiente'
          : 'Disponible parcial';
      cell.appendChild(chip);

      if (confirmed) {
        cell.disabled = true;
        cell.classList.add('disabled');
      }
    } else if (!isPast) {
      const chip = document.createElement('span');
      chip.className = 'status-chip available';
      chip.textContent = 'Disponible';
      cell.appendChild(chip);
    }

    grid.appendChild(cell);
  });

  container.appendChild(headerRow);
  container.appendChild(grid);

  return container;
}

export function attachCalendarControls(prevButton, nextButton, onMonthChange) {
  prevButton.addEventListener('click', () => {
    const current = getMonthReference();
    const updated = shiftMonth(current, -1);
    setMonthReference(updated);
    onMonthChange();
  });

  nextButton.addEventListener('click', () => {
    const current = getMonthReference();
    const updated = shiftMonth(current, 1);
    setMonthReference(updated);
    onMonthChange();
  });
}

export function handleDaySelection(container, onSelect) {
  container.addEventListener('click', (event) => {
    const cell = event.target.closest('.calendar-cell');
    if (!cell || cell.disabled || !cell.dataset.date) {
      return;
    }

    container.querySelectorAll('.calendar-cell.selected').forEach((item) => {
      item.classList.remove('selected');
    });

    cell.classList.add('selected');
    const selectedDate = cell.dataset.date;
    setSelectedDate(selectedDate);
    onSelect(selectedDate);
  });
}
