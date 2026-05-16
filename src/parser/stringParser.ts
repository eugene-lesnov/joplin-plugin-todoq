import strings, { formatLocalizedString } from '../i18n/strings';
import { CommandParseResult, failed, parsed } from './parserTypes';

const DOUBLE_QUOTE = '"';
const BACKSLASH = '\\';

function parseQuotedText(input: string, valueName: string): CommandParseResult<string> {
	let value = '';
	let escaped = false;

	for (let index = 1; index < input.length; index += 1) {
		const character = input.charAt(index);

		if (escaped) {
			value += character;
			escaped = false;
			continue;
		}

		if (character === BACKSLASH) {
			escaped = true;
			continue;
		}

		if (character === DOUBLE_QUOTE) {
			const trailingText = input.slice(index + 1).trim();
			if (trailingText) {
				return failed(formatLocalizedString(strings.parserUnexpectedTextAfter, { name: valueName }));
			}

			return parsed(value);
		}

		value += character;
	}

	return failed(formatLocalizedString(strings.parserMustEndWithQuote, { name: valueName }));
}

export function parseQuotedOrSingleWord(input: string, valueName: string): CommandParseResult<string> {
	const value = input.trim();

	if (!value) {
		return failed(formatLocalizedString(strings.parserExpectedValue, { name: valueName }));
	}

	if (value.charAt(0) === DOUBLE_QUOTE) {
		return parseQuotedText(value, valueName);
	}

	if (/\s/.test(value)) {
		return failed(formatLocalizedString(strings.parserContainsSpaces, { name: valueName }));
	}

	return parsed(value);
}

export function parseRequiredQuotedText(input: string, valueName: string): CommandParseResult<string> {
	const value = input.trim();

	if (!value) {
		return failed(formatLocalizedString(strings.parserExpectedValue, { name: valueName }));
	}

	if (value.charAt(0) !== DOUBLE_QUOTE) {
		return failed(formatLocalizedString(strings.parserMustBeQuoted, { name: valueName }));
	}

	return parseQuotedText(value, valueName);
}
