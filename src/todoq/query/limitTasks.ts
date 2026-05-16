import type { TodoQTask } from '../model/TodoQTask';

export function limitTasks(tasks: TodoQTask[], limit?: number): TodoQTask[] {
	if (typeof limit !== 'number') return tasks;
	if (limit >= tasks.length) return tasks;
	return tasks.slice(0, limit);
}
