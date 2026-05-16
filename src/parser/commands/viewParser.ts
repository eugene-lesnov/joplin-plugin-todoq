import strings, { formatLocalizedString } from '../../i18n/strings';
import type { TodoQField, TodoQView } from '../../types';
import { CommandParseResult, failed, parsed } from '../parserTypes';

const VIEW_LIST = 'list';
const VIEW_CUSTOM = 'custom';
const FIELDS_SEPARATOR = ',';
const SUPPORTED_FIELDS: TodoQField[] = ['due', 'tags', 'path'];
const HEAD_TAIL_PATTERN = /^(\S+)(?:\s+(.*))?$/;

export function parseViewCommand(args: string): CommandParseResult<TodoQView> {
	const value = args.trim();

	if (!value) {
		return failed(strings.parserExpectedView);
	}

	const match = value.match(HEAD_TAIL_PATTERN);
	if (!match) {
		return failed(strings.parserExpectedView);
	}

	const kind = match[1];
	const rest = (match[2] || '').trim();

	if (kind === VIEW_LIST) {
		if (rest) {
			return failed(formatLocalizedString(strings.parserListViewExtraArgs, { value: rest }));
		}
		return parsed({ kind: 'list' });
	}

	if (kind === VIEW_CUSTOM) {
		if (!rest) {
			return failed(strings.parserCustomViewRequiresFields);
		}
		const fieldsResult = parseFields(rest);
		if (!fieldsResult.ok) return fieldsResult;
		return parsed({ kind: 'custom', fields: fieldsResult.value });
	}

	return failed(formatLocalizedString(strings.parserUnsupportedView, { value: kind }));
}

function parseFields(input: string): CommandParseResult<TodoQField[]> {
	const tokens = input.split(FIELDS_SEPARATOR).map(token => token.trim());
	const fields: TodoQField[] = [];

	for (const token of tokens) {
		if (!token) {
			return failed(strings.parserViewFieldsEmpty);
		}
		if (SUPPORTED_FIELDS.indexOf(token as TodoQField) < 0) {
			return failed(formatLocalizedString(strings.parserInvalidViewField, { value: token }));
		}
		const field = token as TodoQField;
		if (fields.indexOf(field) < 0) {
			fields.push(field);
		}
	}

	return parsed(fields);
}
