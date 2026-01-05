export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

export const staffEndpoints = {
  getStaffList: `${API_BASE_URL}/api/staff`,
  createStaff: `${API_BASE_URL}/api/staff`,
};
