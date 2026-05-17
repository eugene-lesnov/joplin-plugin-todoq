import { MARKDOWN_BLOCK_LANGUAGE } from '../constants';
import strings from '../i18n/strings';

const FENCE_MARKER = '```';
const SOURCE_OPEN = `${FENCE_MARKER}${MARKDOWN_BLOCK_LANGUAGE}\n`;

export interface MarkdownItFenceToken {
	content?: string;
	info?: string;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function getFenceLanguage(info: string = ''): string {
	return info.trim().split(/\s+/, 1)[0] || '';
}

export function isTodoQFence(token: MarkdownItFenceToken): boolean {
	return getFenceLanguage(token.info) === MARKDOWN_BLOCK_LANGUAGE;
}

export function renderTodoQBlock(token: MarkdownItFenceToken): string {
	const queryText = token.content || '';
	const escapedSource = escapeHtml(queryText);
	const escapedSourceOpen = escapeHtml(SOURCE_OPEN);
	const escapedSourceClose = escapeHtml(FENCE_MARKER);
	// Pass the raw query text to the client via a URI-encoded data attribute.
	// The client decodes it and asks the main plugin process to execute the query.
	const encodedQuery = escapeHtml(encodeURIComponent(queryText));
	const loadingPlaceholder = queryText.trim()
		? `<div class="todoq-placeholder">${escapeHtml(strings.loadingTasks)}</div>`
		: `<div class="todoq-placeholder">${escapeHtml(strings.emptyQuery)}</div>`;

	const i18nAttrs = [
		`data-todoq-i18n-error-title="${escapeHtml(strings.errorTitle)}"`,
		`data-todoq-i18n-failed-load="${escapeHtml(strings.failedToLoadTasks)}"`,
		`data-todoq-i18n-failed-done="${escapeHtml(strings.failedToMarkDone)}"`,
		`data-todoq-i18n-invalid-encoding="${escapeHtml(strings.invalidQueryEncoding)}"`,
	].join(' ');

	return `
<div class="joplin-editable">
<pre class="joplin-source" data-joplin-language="${MARKDOWN_BLOCK_LANGUAGE}" data-joplin-source-open="${escapedSourceOpen}" data-joplin-source-close="${escapedSourceClose}">${escapedSource}</pre>
<div class="todoq-block" data-todoq-query="${encodedQuery}" ${i18nAttrs}>
${loadingPlaceholder}
</div>
</div>`;
}
