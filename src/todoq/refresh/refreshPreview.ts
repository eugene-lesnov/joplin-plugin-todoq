import joplin from 'api';

const LOG_PREFIX = '[TodoQ]';
const TOGGLE_PANES_COMMAND = 'toggleVisiblePanes';
const TOGGLE_PANES_DELAY_MS = 50;

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Force-refreshes the Markdown preview by cycling the visible panes.
 *
 * Joplin does not expose a public "rerender preview" API; toggling the
 * visible panes is an undocumented but reliable workaround on desktop.
 * The cycle is best-effort: any failure is logged and swallowed so the
 * caller can keep going (for example, after markDone).
 */
export async function refreshTodoQPreview(): Promise<void> {
	try {
		await joplin.commands.execute(TOGGLE_PANES_COMMAND);
		await sleep(TOGGLE_PANES_DELAY_MS);
		await joplin.commands.execute(TOGGLE_PANES_COMMAND);
	} catch (error) {
		// eslint-disable-next-line no-console
		console.warn(
			`${LOG_PREFIX} Could not auto-refresh preview. ` +
			'Switch to another note and back to update TodoQ blocks.',
			error,
		);
	}
}
