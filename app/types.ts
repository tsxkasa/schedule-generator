export interface Subject {
  is_merge: boolean;
  name: string;
  teacher: string[];
}

export interface ScheduleDay {
  day: string;
  subjects: Subject[];
}

export interface ScheduleData {
  student_id: number;
  schedule: ScheduleDay[];
}

export const TIME_SLOT = [
  "8:35",
  "9:20",
  "9:25",
  "10:10",
  "10:30",
  "11:15",
  "11:20",
  "12:05",
  "12:10",
  "12:55",
  "13:50",
  "14:35",
  "14:45",
  "15:30",
  "15:35",
  "16:20",
];

export function getTimeRange(slotIndex: number, isMerge: boolean) {
  const startTime = TIME_SLOT[slotIndex * 2];
  const endIndex = isMerge ? slotIndex * 2 + 3 : slotIndex * 2 + 1;
  const endTime = TIME_SLOT[endIndex];
  return `${startTime} - ${endTime}`;
}

export function getSlotSpan(isMerge: boolean): number {
  return isMerge ? 2 : 1;
}
