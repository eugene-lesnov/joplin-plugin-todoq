import type { DateAnchor, DateExpression } from '../../types';

const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

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

export function isOverdue(timestamp: number, today: Date = new Date()): boolean {
	return timestamp < startOfLocalDay(today).getTime();
}

function anchorToLocalDay(anchor: DateAnchor, now: Date): Date {
	switch (anchor.type) {
		case 'today': return startOfLocalDay(now);
		case 'tomorrow': return addDays(startOfLocalDay(now), 1);
		case 'yesterday': return addDays(startOfLocalDay(now), -1);
		case 'date': {
			const [year, month, day] = anchor.value.split('-').map(Number);
			return new Date(year, month - 1, day);
		}
	}
}

export function resolveDateExpression(expr: DateExpression, now: Date = new Date()): Date {
	const base = anchorToLocalDay(expr.anchor, now);
	if (!expr.offset) return base;

	const unitInDays = expr.offset.unit === 'week' ? DAYS_PER_WEEK : 1;
	const signedDays = (expr.offset.direction === 'plus' ? 1 : -1) * expr.offset.amount * unitInDays;
	return addDays(base, signedDays);
}
