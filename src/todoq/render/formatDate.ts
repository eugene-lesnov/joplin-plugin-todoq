import strings from '../../i18n/strings';
import { addDays, isWithinDay, startOfLocalDay } from '../query/dateUtils';

function padTwo(value: number): string {
	return value < 10 ? `0${value}` : `${value}`;
}

function formatTime(date: Date): string {
	return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
}

function formatIsoDate(date: Date): string {
	return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`;
}

export function formatTaskDue(due: number | null, now: Date = new Date()): string {
	if (!due) return '';

	const dueDate = new Date(due);
	const today = startOfLocalDay(now);
	const time = formatTime(dueDate);

	if (isWithinDay(due, today)) return `${strings.dueToday} ${time}`;
	if (isWithinDay(due, addDays(today, 1))) return `${strings.dueTomorrow} ${time}`;
	if (isWithinDay(due, addDays(today, -1))) return `${strings.dueYesterday} ${time}`;

	return `${formatIsoDate(dueDate)} ${time}`;
}
