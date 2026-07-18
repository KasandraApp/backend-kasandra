import { addDays, format, subDays } from 'date-fns';
export function formatDateLabel(date) {
    return format(date, 'yyyy-MM-dd');
}
export function getHorizonDates(startDate, horizonDays) {
    return Array.from({ length: horizonDays + 1 }, (_, index) => addDays(startDate, index));
}
export function getDateDaysAgo(from, days) {
    return subDays(from, days);
}
export function daysBetween(start, end) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((end.getTime() - start.getTime()) / msPerDay);
}
