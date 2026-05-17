import type { TodoQTask } from '../model/TodoQTask';

export interface JoplinNoteRaw {
	id: string;
	title?: string;
	parent_id?: string;
	is_todo?: number;
	todo_due?: number;
	todo_completed?: number;
	created_time?: number;
	updated_time?: number;
}

export interface JoplinFolderRaw {
	id: string;
	title?: string;
	parent_id?: string;
}

export interface JoplinTagRaw {
	id: string;
	title?: string;
}

export interface FolderLookup {
	getTitle(folderId: string): string | undefined;
	getPath(folderId: string): string | undefined;
}

export interface TagLookup {
	getTitle(tagId: string): string | undefined;
}

function nullableTimestamp(value: number | undefined): number | null {
	return typeof value === 'number' && value > 0 ? value : null;
}

export function mapJoplinNoteToTodoQTask(
	note: JoplinNoteRaw,
	tagIds: string[],
	folders: FolderLookup,
	tags: TagLookup,
): TodoQTask {
	const notebookId = note.parent_id || '';

	return {
		id: note.id,
		title: note.title || '',
		notebookId,
		notebookTitle: folders.getTitle(notebookId),
		notebookPath: folders.getPath(notebookId),
		tagIds,
		tagTitles: tagIds.map(tagId => tags.getTitle(tagId)).filter((title): title is string => !!title),
		due: nullableTimestamp(note.todo_due),
		completed: nullableTimestamp(note.todo_completed),
		createdTime: note.created_time || 0,
		updatedTime: note.updated_time || 0,
	};
}
