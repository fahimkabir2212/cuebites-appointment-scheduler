export type StaffTableRow = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  availabilities: {
    dayOfWeek: string;
    timeRanges: {
      startMinute: number;
      endMinute: number;
    }[];
  }[];
};
