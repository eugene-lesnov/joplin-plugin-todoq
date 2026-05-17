import type { TodoQTask } from '../model/TodoQTask';

export const NOTEBOOK_PATH_SEPARATOR = ' / ';

function normalize(value: string | undefined): string {
	return (value || '').trim().toLowerCase();
}

function splitNotebookPath(path: string | undefined): string[] {
	if (!path) return [];
	return path.split(NOTEBOOK_PATH_SEPARATOR).map(segment => segment.trim()).filter(Boolean);
}

export function matchesNotebookExact(task: TodoQTask, notebookName: string): boolean {
	return normalize(task.notebookTitle) === normalize(notebookName);
}

export function matchesNotebookUnder(task: TodoQTask, notebookName: string): boolean {
	const target = normalize(notebookName);
	if (!target) return false;

	return splitNotebookPath(task.notebookPath).some(segment => normalize(segment) === target);
}
