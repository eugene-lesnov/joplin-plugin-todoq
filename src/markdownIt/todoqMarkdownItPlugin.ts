import { MarkdownItFenceToken, isTodoQFence, renderTodoQBlock } from './todoqRenderer';

interface MarkdownItRenderer {
	rules: Record<string, (...args: unknown[]) => string>;
	renderToken(tokens: unknown[], idx: number, options: unknown): string;
}

interface MarkdownIt {
	renderer: MarkdownItRenderer;
}

const FENCE_RULE_NAME = 'fence';
// Asset paths are resolved relative to this content script's location
// (dist/markdownIt/todoqMarkdownItPlugin.js).
const CSS_ASSET = './todoq.css';
const RESULTS_CSS_ASSET = '../todoq/render/styles.css';
const CLIENT_SCRIPT_ASSET = './assets/todoqClient.js';

function createFenceRenderer(markdownIt: MarkdownIt): (...args: unknown[]) => string {
	const defaultFenceRenderer = markdownIt.renderer.rules[FENCE_RULE_NAME];

	return (...args: unknown[]): string => {
		const [tokens, idx, options, env, slfl] = args as [unknown[], number, unknown, unknown, unknown];
		const token = tokens[idx];

		if (isTodoQFence(token as MarkdownItFenceToken)) {
			return renderTodoQBlock(token as MarkdownItFenceToken);
		}

		if (defaultFenceRenderer) {
			return defaultFenceRenderer(tokens, idx, options, env, slfl);
		}

		return markdownIt.renderer.renderToken(tokens, idx, options);
	};
}

export default function() {
	return {
		plugin: function(markdownIt: MarkdownIt) {
			markdownIt.renderer.rules[FENCE_RULE_NAME] = createFenceRenderer(markdownIt);
		},
		assets: function() {
			return [
				{ name: CSS_ASSET },
				{ name: RESULTS_CSS_ASSET },
				{ name: CLIENT_SCRIPT_ASSET },
			];
		},
	};
}
