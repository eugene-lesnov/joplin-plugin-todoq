import strings from '../../i18n/strings';
import { parseRequiredQuotedText } from '../stringParser';
import { CommandParseResult, failed, parsed } from '../parserTypes';

export function parseTitleCommand(args: string): CommandParseResult<string> {
	const result = parseRequiredQuotedText(args, strings.parserLabelTitle);
	if (!result.ok) return failed(result.message);

	if (!result.value.trim()) {
		return failed(strings.parserTitleEmpty);
	}

	return parsed(result.value);
}
