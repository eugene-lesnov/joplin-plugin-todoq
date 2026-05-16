export interface TodoQTask {
	id: string;
	title: string;
	body?: string;
	notebookId: string;
	notebookTitle?: string;
	notebookPath?: string;
	tagIds: string[];
	tagTitles: string[];
	due: number | null;
	completed: number | null;
	createdTime: number;
	updatedTime: number;
}
