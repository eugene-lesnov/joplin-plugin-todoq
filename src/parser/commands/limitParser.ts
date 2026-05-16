import strings, { formatLocalizedString } from '../../i18n/strings';
import { CommandParseResult, failed, parsed } from '../parserTypes';

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

export function parseLimitCommand(args: string): CommandParseResult<number> {
	const value = args.trim();

	if (!value) {
		return failed(strings.parserExpectedLimit);
	}

	if (!POSITIVE_INTEGER_PATTERN.test(value)) {
		return failed(formatLocalizedString(strings.parserInvalidLimit, { value }));
	}

	const limit = Number(value);

	if (!Number.isSafeInteger(limit)) {
		return failed(formatLocalizedString(strings.parserLimitTooLarge, { value }));
	}

	return parsed(limit);
}
