import type {
	DueFilter,
	NotebookFilter,
	SearchFilter,
	TagFilter,
	TodoQQueryConfig,
	TodoQStatus,
} from '../../types';
import type { TodoQTask } from '../model/TodoQTask';
import {
	addDays,
	isOverdue,
	isWithinCurrentWeek,
	isWithinDay,
} from './dateUtils';
import { limitTasks } from './limitTasks';
import {
	matchesNotebookExact,
	matchesNotebookUnder,
} from './notebookUtils';
import { sortTasks } from './sortTasks';

function isOpen(task: TodoQTask): boolean {
	return !task.completed;
}

function matchesStatus(task: TodoQTask, status: TodoQStatus): boolean {
	if (status === 'all') return true;
	if (status === 'open') return isOpen(task);
	return !isOpen(task);
}

function matchesDue(task: TodoQTask, due: DueFilter, now: Date): boolean {
	if (due.type === 'any') return true;
	if (due.type === 'none') return !task.due;
	if (!task.due) return false;

	if (due.type === 'overdue') {
		return isOpen(task) && isOverdue(task.due, now);
	}

	if (due.type === 'on') {
		const anchor = due.date.anchor;
		if (anchor.type === 'today') return isWithinDay(task.due, now);
		if (anchor.type === 'tomorrow') return isWithinDay(task.due, addDays(now, 1));
		if (anchor.type === 'yesterday') return isWithinDay(task.due, addDays(now, -1));
		return false;
	}

	if (due.type === 'range') {
		const isWeekAlias = due.includeStart && due.includeEnd
			&& due.start.anchor.type === 'today' && !due.start.offset
			&& due.end.anchor.type === 'today'
			&& due.end.offset?.direction === 'plus'
			&& due.end.offset.amount === 7
			&& due.end.offset.unit === 'day';

		if (isWeekAlias) return isWithinCurrentWeek(task.due, now);
	}

	// before/after/range with arbitrary date expressions are not implemented in MVP engine.
	return true;
}

function matchesNotebook(task: TodoQTask, notebook?: NotebookFilter): boolean {
	if (!notebook) return true;
	return notebook.includeChildren
		? matchesNotebookUnder(task, notebook.name)
		: matchesNotebookExact(task, notebook.name);
}

function matchesTags(task: TodoQTask, tag?: TagFilter): boolean {
	if (!tag) return true;

	const taskTags = new Set(task.tagTitles.map(title => title.toLowerCase()));
	const requiredTags = tag.tags.map(value => value.toLowerCase());

	if (tag.mode === 'all') {
		return requiredTags.every(required => taskTags.has(required));
	}

	return requiredTags.some(required => taskTags.has(required));
}

function matchesSearch(task: TodoQTask, search?: SearchFilter): boolean {
	if (!search) return true;
	const needle = search.text.trim().toLowerCase();
	if (!needle) return true;
	return task.title.toLowerCase().includes(needle);
}

export function executeTodoQQuery(
	tasks: TodoQTask[],
	config: TodoQQueryConfig,
	now: Date = new Date(),
): TodoQTask[] {
	const filtered = tasks.filter(task =>
		matchesStatus(task, config.status)
		&& matchesDue(task, config.due, now)
		&& matchesNotebook(task, config.notebook)
		&& matchesTags(task, config.tag)
		&& matchesSearch(task, config.search),
	);

	const sorted = sortTasks(filtered, config.sort);
	return limitTasks(sorted, config.limit);
}
