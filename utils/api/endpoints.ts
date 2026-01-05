export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const staffEndpoints = {
  getStaffList: `${API_BASE_URL}/api/staff`,
  createStaff: `${API_BASE_URL}/api/staff`,
};

export const bookingEndpoints = {
  getBookingList: `${API_BASE_URL}/api/bookings`,
  getBookingDetails: (bookingId: string) =>
    `${API_BASE_URL}/api/bookings/${bookingId}`,
  updateBookingDetails: (bookingId: string) =>
    `${API_BASE_URL}/api/bookings/${bookingId}`,
  deleteBookingDetails: (bookingId: string) =>
    `${API_BASE_URL}/api/bookings/${bookingId}`,
  createBooking: `${API_BASE_URL}/api/bookings`,
};
