export type CommandParseResult<T> =
	| { ok: true; value: T }
	| { ok: false; message: string };

export function parsed<T>(value: T): CommandParseResult<T> {
	return { ok: true, value };
}

export function failed<T = never>(message: string): CommandParseResult<T> {
	return { ok: false, message };
}
