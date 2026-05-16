import strings, { formatLocalizedString } from '../i18n/strings';
import type { TodoQParseError, TodoQParseResult, TodoQQueryConfig } from '../types';
import { parseDueCommand } from './commands/dueParser';
import { parseLimitCommand } from './commands/limitParser';
import { parseNotebookCommand } from './commands/notebookParser';
import { parseSearchCommand } from './commands/searchParser';
import { parseSortCommand } from './commands/sortParser';
import { parseStatusCommand } from './commands/statusParser';
import { parseTagCommand } from './commands/tagParser';
import { parseTitleCommand } from './commands/titleParser';
import { parseViewCommand } from './commands/viewParser';

const COMMENT_PREFIX = '#';
const LINE_BREAK_PATTERN = /\r?\n/;

export function createDefaultQueryConfig(): TodoQQueryConfig {
	return {
		status: 'open',
		due: { type: 'any' },
		sort: { field: 'due', direction: 'asc' },
		view: { kind: 'list' },
	};
}

function createParseError(lineNumber: number, line: string, message: string): TodoQParseError {
	return { lineNumber, line, message };
}

function splitCommand(line: string): { command: string; args: string } {
	const trimmedLine = line.trim();
	const match = trimmedLine.match(/^(\S+)(?:\s+(.*))?$/);

	return {
		command: match ? match[1] : '',
		args: match && match[2] ? match[2] : '',
	};
}

export function parseTodoQQuery(source: string): TodoQParseResult {
	const config = createDefaultQueryConfig();
	const errors: TodoQParseError[] = [];
	const lines = source.split(LINE_BREAK_PATTERN);

	lines.forEach((line, index) => {
		const lineNumber = index + 1;
		const trimmedLine = line.trim();

		if (!trimmedLine || trimmedLine.startsWith(COMMENT_PREFIX)) return;

		const commandLine = splitCommand(trimmedLine);
		const command = commandLine.command;
		const args = commandLine.args;

		if (command === 'status') {
			const result = parseStatusCommand(args);
			if (result.ok) config.status = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		if (command === 'due') {
			const result = parseDueCommand(args);
			if (result.ok) config.due = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		if (command === 'sort') {
			const result = parseSortCommand(args);
			if (result.ok) config.sort = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		if (command === 'view') {
			const result = parseViewCommand(args);
			if (result.ok) config.view = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		if (command === 'limit') {
			const result = parseLimitCommand(args);
			if (result.ok) config.limit = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		if (command === 'notebook') {
			const result = parseNotebookCommand(args);
			if (result.ok) config.notebook = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		if (command === 'tag') {
			const result = parseTagCommand(args);
			if (result.ok) config.tag = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		if (command === 'search') {
			const result = parseSearchCommand(args);
			if (result.ok) config.search = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		if (command === 'title') {
			const result = parseTitleCommand(args);
			if (result.ok) config.title = result.value;
			else errors.push(createParseError(lineNumber, line, result.message));
			return;
		}

		errors.push(createParseError(lineNumber, line, formatLocalizedString(strings.parserUnknownCommand, { command })));
	});

	return { config, errors };
}
