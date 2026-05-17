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
	dayBoundsFor,
	isOverdue,
	isWithinDay,
	resolveDateExpression,
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
		return isWithinDay(task.due, resolveDateExpression(due.date, now));
	}

	if (due.type === 'before') {
		return task.due < dayBoundsFor(resolveDateExpression(due.date, now)).startOfDay;
	}

	if (due.type === 'after') {
		return task.due >= dayBoundsFor(resolveDateExpression(due.date, now)).startOfNextDay;
	}

	const startDay = resolveDateExpression(due.start, now);
	const endDay = resolveDateExpression(due.end, now);
	const lowerBound = due.includeStart
		? dayBoundsFor(startDay).startOfDay
		: dayBoundsFor(startDay).startOfNextDay;
	const upperBoundExclusive = due.includeEnd
		? dayBoundsFor(endDay).startOfNextDay
		: dayBoundsFor(endDay).startOfDay;

	return task.due >= lowerBound && task.due < upperBoundExclusive;
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
