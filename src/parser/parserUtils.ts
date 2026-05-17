const HEAD_TAIL_PATTERN = /^(\S+)(?:\s+(.*))?$/;

export interface FirstWordSplit {
	word: string;
	rest: string;
}

export function splitFirstWord(value: string): FirstWordSplit {
	const match = value.match(HEAD_TAIL_PATTERN);
	return {
		word: match ? match[1] : '',
		rest: match && match[2] ? match[2].trim() : '',
	};
}
