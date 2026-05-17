import strings from '../../i18n/strings';
import type { TodoQField, TodoQView } from '../../types';
import type { TodoQTask } from '../model/TodoQTask';
import { isOverdue } from '../query/dateUtils';
import { escapeHtml } from './escapeHtml';
import { formatTaskDue } from './formatDate';

const ALARM_ICON = '🔔';

export interface TodoQRenderInput {
	tasks: TodoQTask[];
	view: TodoQView;
	title?: string;
	now?: Date;
}

interface TaskViewModel {
	id: string;
	title: string;
	dueLabel: string;
	notebookLabel: string;
	tagsLabel: string;
	isCompleted: boolean;
	isOverdue: boolean;
}

function toViewModel(task: TodoQTask, now: Date): TaskViewModel {
	const isCompleted = !!task.completed;
	const dueText = formatTaskDue(task.due, now);
	const dueLabel = task.due ? `${ALARM_ICON} ${dueText}` : dueText;

	return {
		id: task.id,
		title: task.title || strings.untitledTask,
		dueLabel,
		notebookLabel: task.notebookPath || task.notebookTitle || strings.noNotebookLabel,
		tagsLabel: task.tagTitles.join(', '),
		isCompleted,
		isOverdue: !!task.due && !isCompleted && isOverdue(task.due, now),
	};
}

function taskClassName(viewModel: TaskViewModel, extra: string = ''): string {
	const classes = ['todoq-task'];
	if (viewModel.isOverdue) classes.push('todoq-task-overdue');
	if (viewModel.isCompleted) classes.push('todoq-task-completed');
	if (extra) classes.push(extra);
	return classes.join(' ');
}

function renderCheckbox(viewModel: TaskViewModel): string {
	const checkedAttr = viewModel.isCompleted ? ' checked disabled' : '';
	return `<input type="checkbox" class="todoq-task-checkbox" data-task-id="${escapeHtml(viewModel.id)}"${checkedAttr}>`;
}

function renderTaskRootAttrs(viewModel: TaskViewModel): string {
	return `class="${taskClassName(viewModel)}" data-task-id="${escapeHtml(viewModel.id)}"`;
}

function renderTitle(viewModel: TaskViewModel): string {
	return `<span class="todoq-task-title todoq-open-task" data-task-id="${escapeHtml(viewModel.id)}">${escapeHtml(viewModel.title)}</span>`;
}

function renderMetaItem(label: string): string {
	return `<span>${escapeHtml(label)}</span>`;
}

function isFieldVisible(view: TodoQView, field: TodoQField): boolean {
	if (view.kind === 'list') return true;
	return view.fields.indexOf(field) >= 0;
}

function renderListItem(viewModel: TaskViewModel, view: TodoQView): string {
	const dueRow = isFieldVisible(view, 'due') && viewModel.dueLabel
		? `<div class="todoq-task-meta todoq-task-due">${renderMetaItem(viewModel.dueLabel)}</div>`
		: '';
	const pathRow = isFieldVisible(view, 'path')
		? `<div class="todoq-task-meta todoq-task-notebook">${renderMetaItem(viewModel.notebookLabel)}</div>`
		: '';
	const tagsRow = isFieldVisible(view, 'tags') && viewModel.tagsLabel
		? `<div class="todoq-task-meta todoq-task-tags">${renderMetaItem(viewModel.tagsLabel)}</div>`
		: '';

	return `
<div ${renderTaskRootAttrs(viewModel)}>
	<div class="todoq-task-row">
		${renderCheckbox(viewModel)}
		${renderTitle(viewModel)}
	</div>
	${dueRow}
	${pathRow}
	${tagsRow}
</div>`;
}

function renderListView(viewModels: TaskViewModel[], view: TodoQView): string {
	const items = viewModels.map(vm => renderListItem(vm, view)).join('');
	return `<div class="todoq-results todoq-list">${items}</div>`;
}

function renderEmptyState(): string {
	return `<div class="todoq-results"><div class="todoq-empty">${escapeHtml(strings.emptyStateText)}</div></div>`;
}

function renderBody(viewModels: TaskViewModel[], view: TodoQView): string {
	if (!viewModels.length) return renderEmptyState();
	return renderListView(viewModels, view);
}

export function renderTodoQResults(input: TodoQRenderInput): string {
	const now = input.now || new Date();
	const viewModels = input.tasks.map(task => toViewModel(task, now));
	const header = renderHeader(input.title);

	return `${header}${renderBody(viewModels, input.view)}`;
}

function renderHeader(title: string | undefined): string {
	if (title === '') return '';
	const headerText = title ?? strings.headerLabel;
	return `<div class="todoq-header">${escapeHtml(headerText)}</div>`;
}
