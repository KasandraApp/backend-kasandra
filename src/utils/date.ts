import { addDays, format, subDays } from 'date-fns';

export function formatDateLabel(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getHorizonDates(startDate: Date, horizonDays: number): Date[] {
  return Array.from({ length: horizonDays + 1 }, (_, index) => addDays(startDate, index));
}

export function getDateDaysAgo(from: Date, days: number): Date {
  return subDays(from, days);
}

export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}
