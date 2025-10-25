const state = {
  bookings: [],
  selectedDate: null,
  monthReference: new Date()
};

export function getBookings() {
  return state.bookings;
}

export function setBookings(bookings) {
  state.bookings = bookings;
}

export function addBooking(booking) {
  state.bookings = [booking, ...state.bookings];
}

export function getSelectedDate() {
  return state.selectedDate;
}

export function setSelectedDate(date) {
  state.selectedDate = date;
}

export function getMonthReference() {
  return state.monthReference;
}

export function setMonthReference(date) {
  state.monthReference = date;
}

export function getDayStatusMap() {
  return state.bookings.reduce((acc, booking) => {
    const key = booking.eventDate;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(booking);
    return acc;
  }, {});
}
