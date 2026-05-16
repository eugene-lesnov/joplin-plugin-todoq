import strings, { formatLocalizedString } from '../../i18n/strings';
import type { TodoQSort, TodoQSortDirection, TodoQSortField } from '../../types';
import { CommandParseResult, failed, parsed } from '../parserTypes';

const SUPPORTED_SORT_FIELDS: TodoQSortField[] = ['due', 'title', 'created', 'updated'];
const SUPPORTED_SORT_DIRECTIONS: TodoQSortDirection[] = ['asc', 'desc'];

export function parseSortCommand(args: string): CommandParseResult<TodoQSort> {
	const parts = args.trim().split(/\s+/).filter(Boolean);

	if (parts.length !== 2) {
		return failed(strings.parserSortSyntax);
	}

	const field = parts[0] as TodoQSortField;
	const direction = parts[1] as TodoQSortDirection;

	if (SUPPORTED_SORT_FIELDS.indexOf(field) < 0) {
		return failed(formatLocalizedString(strings.parserInvalidSortField, { value: parts[0] }));
	}

	if (SUPPORTED_SORT_DIRECTIONS.indexOf(direction) < 0) {
		return failed(formatLocalizedString(strings.parserInvalidSortDirection, { value: parts[1] }));
	}

	return parsed({ field, direction });
}
