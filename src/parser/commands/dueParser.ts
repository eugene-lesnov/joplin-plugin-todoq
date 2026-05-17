import strings, { formatLocalizedString } from '../../i18n/strings';
import type { DateExpression, DueFilter } from '../../types';
import { parseDateExpression } from '../dateExpressionParser';
import { CommandParseResult, failed, parsed } from '../parserTypes';

const DUE_ANY = 'any';
const DUE_NONE = 'none';
const DUE_OVERDUE = 'overdue';
const DUE_BEFORE = 'before';
const DUE_AFTER = 'after';
const DUE_RANGE = 'range';
const DUE_WEEK = 'week';
const RANGE_SEPARATOR = ',';
const RANGE_START_INCLUSIVE = '[';
const RANGE_START_EXCLUSIVE = '(';
const RANGE_END_INCLUSIVE = ']';
const RANGE_END_EXCLUSIVE = ')';
const WEEK_ALIAS_DAYS = 7;

function todayDateExpression(): DateExpression {
	return { anchor: { type: 'today' } };
}

function weekAliasEndDateExpression(): DateExpression {
	return {
		anchor: { type: 'today' },
		offset: {
			direction: 'plus',
			amount: WEEK_ALIAS_DAYS,
			unit: 'day',
		},
	};
}

function parseDateFilter(type: 'on' | 'before' | 'after', dateInput: string): CommandParseResult<DueFilter> {
	const dateResult = parseDateExpression(dateInput);
	if (!dateResult.ok) return failed(dateResult.message);

	return parsed({ type, date: dateResult.value });
}

function parseWeekAlias(value: string): CommandParseResult<DueFilter> | undefined {
	if (value !== DUE_WEEK) return undefined;

	return parsed({
		type: 'range',
		start: todayDateExpression(),
		end: weekAliasEndDateExpression(),
		includeStart: true,
		includeEnd: true,
	});
}

function getRangeBoundaryFlags(rangeInput: string): CommandParseResult<{ includeStart: boolean; includeEnd: boolean }> {
	const startBracket = rangeInput.charAt(0);
	const endBracket = rangeInput.charAt(rangeInput.length - 1);

	if (startBracket !== RANGE_START_INCLUSIVE && startBracket !== RANGE_START_EXCLUSIVE) {
		return failed(strings.parserInvalidRangeStartBracket);
	}

	if (endBracket !== RANGE_END_INCLUSIVE && endBracket !== RANGE_END_EXCLUSIVE) {
		return failed(strings.parserInvalidRangeEndBracket);
	}

	return parsed({
		includeStart: startBracket === RANGE_START_INCLUSIVE,
		includeEnd: endBracket === RANGE_END_INCLUSIVE,
	});
}

function splitRangeBody(rangeInput: string): CommandParseResult<{ start: string; end: string }> {
	const rangeBody = rangeInput.slice(1, -1);
	const separatorIndex = rangeBody.indexOf(RANGE_SEPARATOR);

	if (separatorIndex < 0) {
		return failed(strings.parserRangeSyntaxNoComma);
	}

	if (rangeBody.indexOf(RANGE_SEPARATOR, separatorIndex + 1) >= 0) {
		return failed(strings.parserRangeSyntaxMultipleCommas);
	}

	const start = rangeBody.slice(0, separatorIndex).trim();
	const end = rangeBody.slice(separatorIndex + 1).trim();

	if (!start) {
		return failed(strings.parserRangeSyntaxEmptyStart);
	}

	if (!end) {
		return failed(strings.parserRangeSyntaxEmptyEnd);
	}

	return parsed({ start, end });
}

function parseRangeFilter(rangeInput: string): CommandParseResult<DueFilter> {
	const value = rangeInput.trim();

	if (!value) {
		return failed(strings.parserExpectedRangeExpression);
	}

	const boundaryResult = getRangeBoundaryFlags(value);
	if (!boundaryResult.ok) return failed(boundaryResult.message);

	const rangeBodyResult = splitRangeBody(value);
	if (!rangeBodyResult.ok) return failed(rangeBodyResult.message);

	const startResult = parseDateExpression(rangeBodyResult.value.start);
	if (!startResult.ok) return failed(formatLocalizedString(strings.parserInvalidRangeStart, { message: startResult.message }));

	const endResult = parseDateExpression(rangeBodyResult.value.end);
	if (!endResult.ok) return failed(formatLocalizedString(strings.parserInvalidRangeEnd, { message: endResult.message }));

	return parsed({
		type: 'range',
		start: startResult.value,
		end: endResult.value,
		includeStart: boundaryResult.value.includeStart,
		includeEnd: boundaryResult.value.includeEnd,
	});
}

function splitFirstWord(value: string): { word: string; rest: string } {
	const match = value.match(/^(\S+)(?:\s+(.*))?$/);
	return {
		word: match ? match[1] : '',
		rest: match && match[2] ? match[2].trim() : '',
	};
}

function parseImplicitDateFilter(value: string): CommandParseResult<DueFilter> {
	const dateResult = parseDateExpression(value);
	if (!dateResult.ok) {
		return failed(formatLocalizedString(strings.parserInvalidDueValue, { value }));
	}

	return parsed({ type: 'on', date: dateResult.value });
}

export function parseDueCommand(args: string): CommandParseResult<DueFilter> {
	const value = args.trim();

	if (!value) {
		return failed(strings.parserExpectedDue);
	}

	if (value === DUE_ANY) return parsed({ type: 'any' });
	if (value === DUE_NONE) return parsed({ type: 'none' });
	if (value === DUE_OVERDUE) return parsed({ type: 'overdue' });

	const weekAliasResult = parseWeekAlias(value);
	if (weekAliasResult) return weekAliasResult;

	const firstPart = splitFirstWord(value);

	if (firstPart.word === DUE_BEFORE) {
		return parseDateFilter('before', firstPart.rest);
	}

	if (firstPart.word === DUE_AFTER) {
		return parseDateFilter('after', firstPart.rest);
	}

	if (firstPart.word === DUE_RANGE) {
		return parseRangeFilter(firstPart.rest);
	}

	return parseImplicitDateFilter(value);
}
