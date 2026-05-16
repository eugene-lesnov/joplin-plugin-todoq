import strings from '../../i18n/strings';
import type { NotebookFilter } from '../../types';
import { parseQuotedOrSingleWord } from '../stringParser';
import { CommandParseResult, failed, parsed } from '../parserTypes';

const UNDER_KEYWORD = 'under';

function splitFirstWord(value: string): { word: string; rest: string } {
	const match = value.match(/^(\S+)(?:\s+(.*))?$/);
	return {
		word: match ? match[1] : '',
		rest: match && match[2] ? match[2].trim() : '',
	};
}

export function parseNotebookCommand(args: string): CommandParseResult<NotebookFilter> {
	const value = args.trim();

	if (!value) {
		return failed(strings.parserExpectedNotebookName);
	}

	const firstPart = splitFirstWord(value);
	const includeChildren = firstPart.word === UNDER_KEYWORD;
	const notebookNameInput = includeChildren ? firstPart.rest : value;

	if (includeChildren && !notebookNameInput) {
		return failed(strings.parserExpectedNotebookNameAfterUnder);
	}

	const notebookNameResult = parseQuotedOrSingleWord(notebookNameInput, strings.parserLabelNotebookName);
	if (!notebookNameResult.ok) return failed(notebookNameResult.message);

	if (!notebookNameResult.value.trim()) {
		return failed(strings.parserNotebookNameEmpty);
	}

	return parsed({
		name: notebookNameResult.value,
		includeChildren,
	});
}
