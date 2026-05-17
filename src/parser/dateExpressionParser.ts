import strings, { formatLocalizedString } from '../i18n/strings';
import { getDateFormat } from '../settings';
import type {
	DateAnchor,
	DateExpression,
	DateOffsetDirection,
	DateOffsetUnit,
} from '../types';
import { CommandParseResult, failed, parsed } from './parserTypes';

const OFFSET_SUFFIX_PATTERN = /\s*([+-])\s*(\d+)\s*([A-Za-z]+)$/;

interface CompiledDateFormat {
	regex: RegExp;
	groupForYear: number;
	groupForMonth: number;
	groupForDay: number;
}

const TOKEN_PATTERN = /YYYY|YY|MM|M|DD|D/g;
const REGEX_ESCAPE_PATTERN = /[.*+?^${}()|[\]\\]/g;
const FALLBACK_FORMAT = 'YYYY-MM-DD';

const compiledFormatCache = new Map<string, CompiledDateFormat | null>();

function escapeRegex(value: string): string {
	return value.replace(REGEX_ESCAPE_PATTERN, '\\$&');
}

function compileDateFormat(format: string): CompiledDateFormat | null {
	if (compiledFormatCache.has(format)) {
		return compiledFormatCache.get(format) ?? null;
	}

	let regexBody = '';
	let groupIndex = 0;
	let yearGroup = -1;
	let monthGroup = -1;
	let dayGroup = -1;
	let lastIndex = 0;

	for (const match of format.matchAll(TOKEN_PATTERN)) {
		const matchStart = match.index ?? 0;
		regexBody += escapeRegex(format.substring(lastIndex, matchStart));
		groupIndex += 1;

		switch (match[0]) {
			case 'YYYY': regexBody += '(\\d{4})'; yearGroup = groupIndex; break;
			case 'YY': regexBody += '(\\d{2})'; yearGroup = groupIndex; break;
			case 'MM': regexBody += '(\\d{2})'; monthGroup = groupIndex; break;
			case 'M': regexBody += '(\\d{1,2})'; monthGroup = groupIndex; break;
			case 'DD': regexBody += '(\\d{2})'; dayGroup = groupIndex; break;
			case 'D': regexBody += '(\\d{1,2})'; dayGroup = groupIndex; break;
		}

		lastIndex = matchStart + match[0].length;
	}

	regexBody += escapeRegex(format.substring(lastIndex));

	const compiled: CompiledDateFormat | null = (yearGroup >= 0 && monthGroup >= 0 && dayGroup >= 0)
		? { regex: new RegExp(`^${regexBody}$`), groupForYear: yearGroup, groupForMonth: monthGroup, groupForDay: dayGroup }
		: null;

	compiledFormatCache.set(format, compiled);
	return compiled;
}

function getActiveDateFormat(): { format: string; compiled: CompiledDateFormat } {
	const configured = getDateFormat();
	const compiled = compileDateFormat(configured);
	if (compiled) return { format: configured, compiled };

	const fallback = compileDateFormat(FALLBACK_FORMAT);
	// Fallback is a literal constant and is guaranteed to compile.
	return { format: FALLBACK_FORMAT, compiled: fallback as CompiledDateFormat };
}

function isLeapYear(year: number): boolean {
	return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}

function getDaysInMonth(year: number, month: number): number {
	const daysByMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	return daysByMonth[month - 1] || 0;
}

function expandTwoDigitYear(year: number): number {
	// Common pivot: 00..68 -> 2000..2068, 69..99 -> 1969..1999.
	return year >= 69 ? 1900 + year : 2000 + year;
}

function pad2(value: number): string {
	return value < 10 ? `0${value}` : String(value);
}

interface ParsedCalendarDate {
	year: number;
	month: number;
	day: number;
}

function tryParseFormattedDate(value: string, compiled: CompiledDateFormat): ParsedCalendarDate | null {
	const match = value.match(compiled.regex);
	if (!match) return null;

	const rawYear = Number(match[compiled.groupForYear]);
	const month = Number(match[compiled.groupForMonth]);
	const day = Number(match[compiled.groupForDay]);

	if (!Number.isFinite(rawYear) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

	const year = match[compiled.groupForYear].length === 2 ? expandTwoDigitYear(rawYear) : rawYear;

	if (month < 1 || month > 12) return null;
	if (day < 1 || day > getDaysInMonth(year, month)) return null;

	return { year, month, day };
}

function toIsoDate(date: ParsedCalendarDate): string {
	return `${String(date.year).padStart(4, '0')}-${pad2(date.month)}-${pad2(date.day)}`;
}

function parseDateAnchor(value: string, format: string, compiled: CompiledDateFormat): CommandParseResult<DateAnchor> {
	if (value === 'today') return parsed({ type: 'today' });
	if (value === 'tomorrow') return parsed({ type: 'tomorrow' });
	if (value === 'yesterday') return parsed({ type: 'yesterday' });

	const calendarDate = tryParseFormattedDate(value, compiled);
	if (calendarDate) {
		return parsed({ type: 'date', value: toIsoDate(calendarDate) });
	}

	return failed(formatLocalizedString(strings.parserUnsupportedDateAnchor, { value, format }));
}

function parseDateOffsetUnit(value: string): CommandParseResult<DateOffsetUnit> {
	if (value === 'd' || value === 'day' || value === 'days') return parsed('day');
	if (value === 'w' || value === 'week' || value === 'weeks') return parsed('week');

	return failed(formatLocalizedString(strings.parserUnsupportedOffsetUnit, { value }));
}

function parseDateOffsetAmount(value: string): CommandParseResult<number> {
	const amount = Number(value);

	if (!Number.isSafeInteger(amount) || amount <= 0) {
		return failed(formatLocalizedString(strings.parserInvalidOffsetAmount, { value }));
	}

	return parsed(amount);
}

export function parseDateExpression(input: string): CommandParseResult<DateExpression> {
	const value = input.trim();

	if (!value) {
		return failed(strings.parserExpectedDateExpression);
	}

	const { format, compiled } = getActiveDateFormat();
	const offsetMatch = value.match(OFFSET_SUFFIX_PATTERN);
	const hasOffset = offsetMatch && offsetMatch.index !== undefined && offsetMatch.index > 0;

	const anchorPart = hasOffset ? value.slice(0, offsetMatch!.index).trimEnd() : value;

	if (!anchorPart) {
		return failed(formatLocalizedString(strings.parserInvalidDateExpression, { value: input, format }));
	}

	const anchorResult = parseDateAnchor(anchorPart, format, compiled);
	if (!anchorResult.ok) return failed(anchorResult.message);

	if (!hasOffset) {
		return parsed({ anchor: anchorResult.value });
	}

	const amountResult = parseDateOffsetAmount(offsetMatch![2]);
	if (!amountResult.ok) return failed(amountResult.message);

	const unitResult = parseDateOffsetUnit(offsetMatch![3]);
	if (!unitResult.ok) return failed(unitResult.message);

	const direction: DateOffsetDirection = offsetMatch![1] === '+' ? 'plus' : 'minus';

	return parsed({
		anchor: anchorResult.value,
		offset: {
			direction,
			amount: amountResult.value,
			unit: unitResult.value,
		},
	});
}
