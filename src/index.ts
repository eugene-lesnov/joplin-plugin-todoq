import joplin from 'api';
import { ContentScriptType, MenuItemLocation } from 'api/types';

import {
	JOPLIN_OPEN_NOTE_COMMAND,
	REFRESH_QUERIES_COMMAND,
	REFRESH_QUERIES_MENU_ITEM_ID,
	TODOQ_MARKDOWN_IT_CONTENT_SCRIPT_ID,
	TODOQ_MARKDOWN_IT_CONTENT_SCRIPT_PATH,
	TODOQ_MARK_DONE_MESSAGE_TYPE,
	TODOQ_OPEN_TASK_MESSAGE_TYPE,
	TODOQ_RUN_QUERY_MESSAGE_TYPE,
} from './constants';
import strings from './i18n/strings';
import { registerTodoQSettings } from './settings';
import { invalidateTodoQTaskCache } from './todoq/data/TodoQTaskRepository';
import { refreshTodoQPreview } from './todoq/refresh/refreshPreview';
import { runTodoQQueryToHtml } from './todoq/service/TodoQService';

const LOG_PREFIX = '[TodoQ]';

interface TodoQContentMessage {
	type?: string;
	taskId?: string;
	query?: string;
}

interface TodoQContentResponse {
	ok: boolean;
	message?: string;
	html?: string;
}

function failure(message: string): TodoQContentResponse {
	return { ok: false, message };
}

async function handleRunQuery(queryText: string): Promise<TodoQContentResponse> {
	try {
		const html = await runTodoQQueryToHtml(queryText);
		return { ok: true, html };
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(LOG_PREFIX, 'runQuery failed', error);
		return failure(strings.failedToRenderQuery);
	}
}

async function handleOpenTask(taskId: string): Promise<TodoQContentResponse> {
	try {
		await joplin.commands.execute(JOPLIN_OPEN_NOTE_COMMAND, taskId);
		return { ok: true };
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(LOG_PREFIX, 'failed to open task', taskId, error);
		return failure(strings.failedToOpenTask);
	}
}

async function handleMarkDone(taskId: string): Promise<TodoQContentResponse> {
	try {
		await joplin.data.put(['notes', taskId], null, { todo_completed: Date.now() });
		invalidateTodoQTaskCache();
		return { ok: true };
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(LOG_PREFIX, 'failed to mark task done', taskId, error);
		return failure(strings.failedToMarkDone);
	}
}

async function handleContentScriptMessage(message: TodoQContentMessage): Promise<TodoQContentResponse | void> {
	if (!message || !message.type) return;

	if (message.type === TODOQ_RUN_QUERY_MESSAGE_TYPE) {
		return handleRunQuery(message.query || '');
	}

	if (message.type === TODOQ_OPEN_TASK_MESSAGE_TYPE) {
		if (!message.taskId) {
			// eslint-disable-next-line no-console
			console.warn(LOG_PREFIX, 'openTask message without taskId');
			return failure(strings.missingTaskId);
		}
		return handleOpenTask(message.taskId);
	}

	if (message.type === TODOQ_MARK_DONE_MESSAGE_TYPE) {
		if (!message.taskId) {
			// eslint-disable-next-line no-console
			console.warn(LOG_PREFIX, 'markDone message without taskId');
			return failure(strings.missingTaskId);
		}
		return handleMarkDone(message.taskId);
	}
}

joplin.plugins.register({
	onStart: async function() {
		await registerTodoQSettings(async () => {
			await refreshTodoQPreview();
		});

		await joplin.commands.register({
			name: REFRESH_QUERIES_COMMAND,
			label: strings.refreshQueriesCommandLabel,
			execute: async () => {
				invalidateTodoQTaskCache();
				await refreshTodoQPreview();
			},
		});

		await joplin.views.menuItems.create(
			REFRESH_QUERIES_MENU_ITEM_ID,
			REFRESH_QUERIES_COMMAND,
			MenuItemLocation.Tools,
		);

		await joplin.contentScripts.register(
			ContentScriptType.MarkdownItPlugin,
			TODOQ_MARKDOWN_IT_CONTENT_SCRIPT_ID,
			TODOQ_MARKDOWN_IT_CONTENT_SCRIPT_PATH,
		);

		await joplin.contentScripts.onMessage(
			TODOQ_MARKDOWN_IT_CONTENT_SCRIPT_ID,
			handleContentScriptMessage,
		);

		await joplin.workspace.onNoteChange(() => {
			invalidateTodoQTaskCache();
		});
	},
});
