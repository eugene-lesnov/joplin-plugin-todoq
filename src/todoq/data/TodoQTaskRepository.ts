import joplin from 'api';

import type { TodoQTask } from '../model/TodoQTask';
import {
	FolderLookup,
	JoplinFolderRaw,
	JoplinNoteRaw,
	JoplinTagRaw,
	TagLookup,
	mapJoplinNoteToTodoQTask,
} from './JoplinTodoMapper';

const TODO_SEARCH_QUERY = 'type:todo';
const NOTE_FIELDS = [
	'id',
	'title',
	'body',
	'parent_id',
	'is_todo',
	'todo_due',
	'todo_completed',
	'created_time',
	'updated_time',
];
const FOLDER_FIELDS = ['id', 'title', 'parent_id'];
const TAG_FIELDS = ['id', 'title'];
const NOTEBOOK_PATH_SEPARATOR = ' / ';

interface PagedResponse<T> {
	items: T[];
	has_more?: boolean;
}

async function fetchAllPages<T>(
	loadPage: (page: number) => Promise<PagedResponse<T>>,
): Promise<T[]> {
	const items: T[] = [];
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const response = await loadPage(page);
		items.push(...response.items);
		hasMore = Boolean(response.has_more);
		page += 1;
	}

	return items;
}

function buildFolderLookup(folders: JoplinFolderRaw[]): FolderLookup {
	const folderById = new Map<string, JoplinFolderRaw>();
	const pathCache = new Map<string, string>();

	for (const folder of folders) {
		folderById.set(folder.id, folder);
	}

	function buildPath(folderId: string, visited: Set<string>): string | undefined {
		if (pathCache.has(folderId)) return pathCache.get(folderId);
		if (visited.has(folderId)) return undefined;

		const folder = folderById.get(folderId);
		if (!folder) return undefined;

		visited.add(folderId);
		const title = folder.title || '';
		const parentPath = folder.parent_id ? buildPath(folder.parent_id, visited) : undefined;
		const path = parentPath ? `${parentPath}${NOTEBOOK_PATH_SEPARATOR}${title}` : title;

		pathCache.set(folderId, path);
		return path;
	}

	return {
		getTitle: folderId => folderById.get(folderId)?.title,
		getPath: folderId => buildPath(folderId, new Set()),
	};
}

function buildTagLookup(tags: JoplinTagRaw[]): TagLookup {
	const titleById = new Map<string, string>();
	for (const tag of tags) {
		if (tag.title) titleById.set(tag.id, tag.title);
	}

	return {
		getTitle: tagId => titleById.get(tagId),
	};
}

async function loadAllFolders(): Promise<JoplinFolderRaw[]> {
	return fetchAllPages<JoplinFolderRaw>(page => joplin.data.get(['folders'], {
		fields: FOLDER_FIELDS,
		page,
	}));
}

async function loadAllTags(): Promise<JoplinTagRaw[]> {
	return fetchAllPages<JoplinTagRaw>(page => joplin.data.get(['tags'], {
		fields: TAG_FIELDS,
		page,
	}));
}

async function loadTodoNotes(): Promise<JoplinNoteRaw[]> {
	return fetchAllPages<JoplinNoteRaw>(page => joplin.data.get(['search'], {
		query: TODO_SEARCH_QUERY,
		type: 'note',
		fields: NOTE_FIELDS,
		page,
	}));
}

async function loadNoteIdsByTag(tagId: string): Promise<string[]> {
	const notes = await fetchAllPages<{ id: string }>(page => joplin.data.get(['tags', tagId, 'notes'], {
		fields: ['id'],
		page,
	}));
	return notes.map(note => note.id).filter(Boolean);
}

async function buildNoteTagIdsIndex(tags: JoplinTagRaw[]): Promise<Map<string, string[]>> {
	const tagToNoteIds = await Promise.all(
		tags.map(async tag => ({ tagId: tag.id, noteIds: await loadNoteIdsByTag(tag.id) })),
	);

	const index = new Map<string, string[]>();
	for (const { tagId, noteIds } of tagToNoteIds) {
		for (const noteId of noteIds) {
			const existing = index.get(noteId);
			if (existing) existing.push(tagId);
			else index.set(noteId, [tagId]);
		}
	}
	return index;
}

let cachedTasksPromise: Promise<TodoQTask[]> | null = null;

async function loadAllTodoTasksFresh(): Promise<TodoQTask[]> {
	const [todoNotes, folders, tags] = await Promise.all([
		loadTodoNotes(),
		loadAllFolders(),
		loadAllTags(),
	]);

	const folderLookup = buildFolderLookup(folders);
	const tagLookup = buildTagLookup(tags);
	const noteTagIdsIndex = await buildNoteTagIdsIndex(tags);

	return todoNotes.map(note => mapJoplinNoteToTodoQTask(
		note,
		noteTagIdsIndex.get(note.id) || [],
		folderLookup,
		tagLookup,
	));
}

export async function loadAllTodoTasks(): Promise<TodoQTask[]> {
	if (!cachedTasksPromise) {
		cachedTasksPromise = loadAllTodoTasksFresh().catch(error => {
			cachedTasksPromise = null;
			throw error;
		});
	}
	return cachedTasksPromise;
}

export function invalidateTodoQTaskCache(): void {
	cachedTasksPromise = null;
}
