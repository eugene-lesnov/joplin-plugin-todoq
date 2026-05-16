import strings, { formatLocalizedString } from '../../i18n/strings';
import type { TodoQStatus } from '../../types';
import { CommandParseResult, failed, parsed } from '../parserTypes';

const SUPPORTED_STATUS_VALUES: TodoQStatus[] = ['open', 'done', 'all'];

export function parseStatusCommand(args: string): CommandParseResult<TodoQStatus> {
	const value = args.trim();

	if (!value) {
		return failed(strings.parserExpectedStatus);
	}

	if (/\s/.test(value) || SUPPORTED_STATUS_VALUES.indexOf(value as TodoQStatus) < 0) {
		return failed(formatLocalizedString(strings.parserInvalidStatus, { value }));
	}

	return parsed(value as TodoQStatus);
}
