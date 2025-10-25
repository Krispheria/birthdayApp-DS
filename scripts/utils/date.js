import { appConfig } from '../config.js';

const { locale, timeZone } = appConfig;

export function createMonthReference(offset = 0) {
  const now = new Date();
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  now.setMonth(now.getMonth() + offset);
  return now;
}

export function shiftMonth(baseDate, delta) {
  const reference = new Date(baseDate.getTime());
  reference.setMonth(reference.getMonth() + delta);
  reference.setDate(1);
  reference.setHours(0, 0, 0, 0);
  return reference;
}

export function formatMonthTitle(date) {
  return date.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
    timeZone
  });
}

export function getMonthMatrix(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

export function isPastDay(date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return date < now;
}

export function formatLongDate(date) {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone
  });
}
