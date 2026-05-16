import { MARKDOWN_BLOCK_LANGUAGE } from './constants';

export type TodoQBlockLanguage = typeof MARKDOWN_BLOCK_LANGUAGE;

export interface TodoQQueryBlock {
	language: TodoQBlockLanguage;
	content: string;
}

export type TodoQStatus = 'open' | 'done' | 'all';

export type TodoQField = 'due' | 'tags' | 'path';

export type TodoQView =
	| { kind: 'list' }
	| { kind: 'custom'; fields: TodoQField[] };

export type TodoQSortField = 'due' | 'title' | 'created' | 'updated';
export type TodoQSortDirection = 'asc' | 'desc';

export interface TodoQSort {
	field: TodoQSortField;
	direction: TodoQSortDirection;
}

export type DateOffsetDirection = 'plus' | 'minus';
export type DateOffsetUnit = 'day' | 'week';

export type DateAnchor =
	| { type: 'today' }
	| { type: 'tomorrow' }
	| { type: 'yesterday' }
	| { type: 'date'; value: string };

export interface DateOffset {
	direction: DateOffsetDirection;
	amount: number;
	unit: DateOffsetUnit;
}

export interface DateExpression {
	anchor: DateAnchor;
	offset?: DateOffset;
}

export type DueFilter =
	| { type: 'any' }
	| { type: 'none' }
	| { type: 'overdue' }
	| { type: 'on'; date: DateExpression }
	| { type: 'before'; date: DateExpression }
	| { type: 'after'; date: DateExpression }
	| {
		type: 'range';
		start: DateExpression;
		end: DateExpression;
		includeStart: boolean;
		includeEnd: boolean;
	};

export interface NotebookFilter {
	name: string;
	includeChildren: boolean;
}

export type TagMatchMode = 'any' | 'all';

export interface TagFilter {
	mode: TagMatchMode;
	tags: string[];
}

export interface SearchFilter {
	text: string;
}

export interface TodoQQueryConfig {
	status: TodoQStatus;
	due: DueFilter;
	sort: TodoQSort;
	view: TodoQView;
	limit?: number;
	notebook?: NotebookFilter;
	tag?: TagFilter;
	search?: SearchFilter;
	title?: string;
}

export interface TodoQParseError {
	lineNumber: number;
	line: string;
	message: string;
}

export interface TodoQParseResult {
	config: TodoQQueryConfig;
	errors: TodoQParseError[];
}
