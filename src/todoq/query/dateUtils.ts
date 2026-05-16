const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;

export interface DayBounds {
	startOfDay: number;
	startOfNextDay: number;
}

export function startOfLocalDay(now: Date = new Date()): Date {
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date: Date, days: number): Date {
	const result = new Date(date.getTime());
	result.setDate(result.getDate() + days);
	return result;
}

export function dayBoundsFor(date: Date): DayBounds {
	const start = startOfLocalDay(date).getTime();
	return {
		startOfDay: start,
		startOfNextDay: start + MILLIS_PER_DAY,
	};
}

export function isWithinDay(timestamp: number, day: Date): boolean {
	const bounds = dayBoundsFor(day);
	return timestamp >= bounds.startOfDay && timestamp < bounds.startOfNextDay;
}

export function isWithinNextDays(timestamp: number, startDay: Date, daysCount: number): boolean {
	const start = startOfLocalDay(startDay).getTime();
	const endExclusive = start + daysCount * MILLIS_PER_DAY;
	return timestamp >= start && timestamp < endExclusive;
}

export function isWithinCurrentWeek(timestamp: number, today: Date = new Date()): boolean {
	return isWithinNextDays(timestamp, today, WEEK_DAYS);
}

export function isOverdue(timestamp: number, today: Date = new Date()): boolean {
	return timestamp < startOfLocalDay(today).getTime();
}
