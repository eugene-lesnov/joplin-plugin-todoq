import strings, { formatLocalizedString } from '../../i18n/strings';
import type { TagFilter, TagMatchMode } from '../../types';
import { CommandParseResult, failed, parsed } from '../parserTypes';

const ANY_MODE = 'any';
const ALL_MODE = 'all';

function splitFirstWord(value: string): { word: string; rest: string } {
	const match = value.match(/^(\S+)(?:\s+(.*))?$/);
	return {
		word: match ? match[1] : '',
		rest: match && match[2] ? match[2].trim() : '',
	};
}

function parseTags(value: string): CommandParseResult<string[]> {
	if (!value.trim()) {
		return failed(strings.parserTagListEmpty);
	}

	const tags = value.split(',').map(tag => tag.trim());

	for (const tag of tags) {
		if (!tag) {
			return failed(strings.parserTagListContainsEmptyTag);
		}

		if (/\s/.test(tag)) {
			return failed(formatLocalizedString(strings.parserTagContainsWhitespace, { value: tag }));
		}
	}

	return parsed(tags);
}

export function parseTagCommand(args: string): CommandParseResult<TagFilter> {
	const value = args.trim();

	if (!value) {
		return failed(strings.parserExpectedAtLeastOneTag);
	}

	const firstPart = splitFirstWord(value);
	let mode: TagMatchMode = ANY_MODE;
	let tagsInput = value;

	if (firstPart.word === ANY_MODE || firstPart.word === ALL_MODE) {
		mode = firstPart.word;
		tagsInput = firstPart.rest;
	}

	const tagsResult = parseTags(tagsInput);
	if (!tagsResult.ok) return failed(tagsResult.message);

	return parsed({ mode, tags: tagsResult.value });
}
