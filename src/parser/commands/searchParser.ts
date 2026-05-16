import strings from '../../i18n/strings';
import type { SearchFilter } from '../../types';
import { parseRequiredQuotedText } from '../stringParser';
import { CommandParseResult, failed, parsed } from '../parserTypes';

export function parseSearchCommand(args: string): CommandParseResult<SearchFilter> {
	const searchTextResult = parseRequiredQuotedText(args, strings.parserLabelSearchText);
	if (!searchTextResult.ok) return failed(searchTextResult.message);

	if (!searchTextResult.value.trim()) {
		return failed(strings.parserSearchTextEmpty);
	}

	return parsed({ text: searchTextResult.value });
}
