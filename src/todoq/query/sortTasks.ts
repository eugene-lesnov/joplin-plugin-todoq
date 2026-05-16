import type { TodoQSort, TodoQSortDirection, TodoQSortField } from '../../types';
import type { TodoQTask } from '../model/TodoQTask';

type TaskComparator = (a: TodoQTask, b: TodoQTask) => number;

const TITLE_COLLATOR = new Intl.Collator(undefined, {
	sensitivity: 'base',
	usage: 'sort',
});

function compareTitles(a: TodoQTask, b: TodoQTask): number {
	return TITLE_COLLATOR.compare(a.title, b.title);
}

function compareNumeric(a: number, b: number): number {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
}

function compareNullableNumeric(
	a: number | null,
	b: number | null,
	direction: TodoQSortDirection,
): number {
	// Tasks without a value always go last, regardless of sort direction.
	const aMissing = a === null;
	const bMissing = b === null;
	if (aMissing && bMissing) return 0;
	if (aMissing) return 1;
	if (bMissing) return -1;

	const cmp = compareNumeric(a as number, b as number);
	return direction === 'asc' ? cmp : -cmp;
}

function buildPrimaryComparator(field: TodoQSortField, direction: TodoQSortDirection): TaskComparator {
	if (field === 'due') {
		return (a, b) => compareNullableNumeric(a.due, b.due, direction);
	}

	if (field === 'title') {
		return (a, b) => (direction === 'asc' ? compareTitles(a, b) : -compareTitles(a, b));
	}

	if (field === 'created') {
		return (a, b) => {
			const cmp = compareNumeric(a.createdTime, b.createdTime);
			return direction === 'asc' ? cmp : -cmp;
		};
	}

	return (a, b) => {
		const cmp = compareNumeric(a.updatedTime, b.updatedTime);
		return direction === 'asc' ? cmp : -cmp;
	};
}

function buildComparator(sort: TodoQSort): TaskComparator {
	const primary = buildPrimaryComparator(sort.field, sort.direction);

	return (a, b) => {
		const primaryResult = primary(a, b);
		if (primaryResult !== 0) return primaryResult;
		// Stable secondary order by title for equal primary values.
		return compareTitles(a, b);
	};
}

export function sortTasks(tasks: TodoQTask[], sort: TodoQSort): TodoQTask[] {
	// Decorate-sort-undecorate keeps the sort stable even on engines without a stable sort.
	const indexed = tasks.map((task, index) => ({ task, index }));
	const comparator = buildComparator(sort);

	indexed.sort((a, b) => {
		const result = comparator(a.task, b.task);
		return result !== 0 ? result : a.index - b.index;
	});

	return indexed.map(entry => entry.task);
}
