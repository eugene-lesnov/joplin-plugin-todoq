import strings, { formatLocalizedString } from '../../i18n/strings';
import { parseTodoQQuery } from '../../parser/todoqParser';
import type { TodoQParseError } from '../../types';
import { loadAllTodoTasks } from '../data/TodoQTaskRepository';
import { executeTodoQQuery } from '../query/TodoQEngine';
import { escapeHtml } from '../render/escapeHtml';
import { renderTodoQResults } from '../render/TodoQHtmlRenderer';

const LOG_PREFIX = '[TodoQ]';

function renderParseErrorsHtml(errors: TodoQParseError[]): string {
	const items = errors
		.map(error => `<li>${escapeHtml(formatLocalizedString(strings.parseErrorLine, { line: error.lineNumber, message: error.message }))}</li>`)
		.join('');

	return `
<div class="todoq-errors">
<div class="todoq-errors-title">${escapeHtml(strings.parseErrorTitle)}</div>
<ul class="todoq-error-list">${items}</ul>
</div>`;
}

function renderRuntimeErrorHtml(message: string): string {
	return `
<div class="todoq-errors">
<div class="todoq-errors-title">${escapeHtml(strings.runtimeErrorTitle)}</div>
<div>${escapeHtml(message)}</div>
</div>`;
}

export async function runTodoQQueryToHtml(queryText: string): Promise<string> {
	const parseResult = parseTodoQQuery(queryText);

	if (parseResult.errors.length > 0) {
		return renderParseErrorsHtml(parseResult.errors);
	}

	try {
		const tasks = await loadAllTodoTasks();
		const filtered = executeTodoQQuery(tasks, parseResult.config);
		return renderTodoQResults({
			tasks: filtered,
			view: parseResult.config.view,
			title: parseResult.config.title,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(LOG_PREFIX, 'runTodoQQueryToHtml failed', error);
		const message = error instanceof Error ? error.message : String(error);
		return renderRuntimeErrorHtml(message);
	}
}
