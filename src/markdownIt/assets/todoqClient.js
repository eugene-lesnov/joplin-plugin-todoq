// TodoQ content script asset. Loaded inside the Joplin Markdown renderer webview.
// Responsibilities:
//   1) Find rendered TodoQ block placeholders and ask the main plugin process
//      to execute the query, then inject the resulting HTML.
//   2) Delegate clicks on task buttons (open / done) back to the main process.
(function () {
	'use strict';

	var CONTENT_SCRIPT_ID = 'todoq.markdownIt';

	var MESSAGE_RUN_QUERY = 'todoq.runQuery';
	var MESSAGE_OPEN_TASK = 'todoq.openTask';
	var MESSAGE_MARK_DONE = 'todoq.markDone';

	var SELECTOR_BLOCK = '.todoq-block[data-todoq-query]';
	var SELECTOR_OPEN = '.todoq-open-task';
	var SELECTOR_CHECKBOX = '.todoq-task-checkbox';
	var SELECTOR_TASK = '.todoq-task';
	var SELECTOR_INLINE_ERROR = '.todoq-task-error';

	var CLASS_TASK_COMPLETED = 'todoq-task-completed';
	var CLASS_INLINE_ERROR = 'todoq-task-error';

	var ATTR_TASK_ID = 'data-task-id';
	var ATTR_QUERY = 'data-todoq-query';
	var ATTR_READY = 'data-todoq-ready';

	var ATTR_I18N_ERROR_TITLE = 'data-todoq-i18n-error-title';
	var ATTR_I18N_FAILED_LOAD = 'data-todoq-i18n-failed-load';
	var ATTR_I18N_FAILED_DONE = 'data-todoq-i18n-failed-done';
	var ATTR_I18N_INVALID_ENCODING = 'data-todoq-i18n-invalid-encoding';

	var FALLBACK_ERROR_TITLE = 'TodoQ error:';
	var FALLBACK_DONE_ERROR = 'Failed to mark task done';
	var FALLBACK_RUN_ERROR = 'Failed to load TodoQ tasks';
	var FALLBACK_INVALID_ENCODING = 'Invalid query encoding';
	var LOG_PREFIX = '[TodoQ]';

	function readBlockI18n(blockElement, attr, fallback) {
		if (!blockElement) return fallback;
		var value = blockElement.getAttribute(attr);
		return value || fallback;
	}

	function postMessage(message) {
		if (typeof webviewApi === 'undefined' || !webviewApi || typeof webviewApi.postMessage !== 'function') {
			// eslint-disable-next-line no-console
			console.error(LOG_PREFIX, 'webviewApi is not available');
			return Promise.reject(new Error('webviewApi not available'));
		}

		try {
			return Promise.resolve(webviewApi.postMessage(CONTENT_SCRIPT_ID, message));
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(LOG_PREFIX, 'failed to post message', error);
			return Promise.reject(error);
		}
	}

	function showRuntimeError(blockElement, message) {
		var title = readBlockI18n(blockElement, ATTR_I18N_ERROR_TITLE, FALLBACK_ERROR_TITLE);
		var fallback = readBlockI18n(blockElement, ATTR_I18N_FAILED_LOAD, FALLBACK_RUN_ERROR);
		blockElement.innerHTML =
			'<div class="todoq-errors"><div class="todoq-errors-title"></div><div></div></div>';
		blockElement.querySelector('.todoq-errors-title').textContent = title;
		blockElement.querySelector('.todoq-errors div:last-child').textContent =
			message || fallback;
	}

	function hydrateBlock(blockElement) {
		if (blockElement.getAttribute(ATTR_READY) === '1') return;
		blockElement.setAttribute(ATTR_READY, '1');

		var encoded = blockElement.getAttribute(ATTR_QUERY) || '';
		var queryText;
		try {
			queryText = decodeURIComponent(encoded);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(LOG_PREFIX, 'failed to decode query', error);
			showRuntimeError(
				blockElement,
				readBlockI18n(blockElement, ATTR_I18N_INVALID_ENCODING, FALLBACK_INVALID_ENCODING)
			);
			return;
		}

		postMessage({ type: MESSAGE_RUN_QUERY, query: queryText })
			.then(function (response) {
				if (response && typeof response.html === 'string') {
					blockElement.innerHTML = response.html;
					return;
				}
				showRuntimeError(blockElement, response && response.message);
			})
			.catch(function (error) {
				// eslint-disable-next-line no-console
				console.error(LOG_PREFIX, 'runQuery failed', error);
				showRuntimeError(
					blockElement,
					readBlockI18n(blockElement, ATTR_I18N_FAILED_LOAD, FALLBACK_RUN_ERROR)
				);
			});
	}

	function hydrateAllBlocks() {
		var blocks = document.querySelectorAll(SELECTOR_BLOCK);
		for (var i = 0; i < blocks.length; i += 1) {
			hydrateBlock(blocks[i]);
		}
	}

	function findContainingBlock(element) {
		return element ? element.closest(SELECTOR_BLOCK) : null;
	}

	function clearTaskError(taskElement) {
		if (!taskElement) return;
		var existing = taskElement.querySelector(SELECTOR_INLINE_ERROR);
		if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
	}

	function showTaskError(taskElement, message) {
		if (!taskElement) return;
		clearTaskError(taskElement);
		var errorEl = document.createElement('div');
		errorEl.className = CLASS_INLINE_ERROR;
		var block = findContainingBlock(taskElement);
		var fallback = readBlockI18n(block, ATTR_I18N_FAILED_DONE, FALLBACK_DONE_ERROR);
		errorEl.textContent = message || fallback;
		taskElement.appendChild(errorEl);
	}

	function markTaskCompletedInDom(taskElement) {
		if (!taskElement) return;
		taskElement.classList.add(CLASS_TASK_COMPLETED);
		var checkbox = taskElement.querySelector(SELECTOR_CHECKBOX);
		if (checkbox) {
			checkbox.checked = true;
			checkbox.disabled = true;
		}
	}

	function getTaskId(element) {
		return element ? element.getAttribute(ATTR_TASK_ID) : null;
	}

	function handleOpenClick(trigger) {
		var taskId = getTaskId(trigger);
		if (!taskId) {
			// eslint-disable-next-line no-console
			console.warn(LOG_PREFIX, 'open click without', ATTR_TASK_ID);
			return;
		}

		postMessage({ type: MESSAGE_OPEN_TASK, taskId: taskId })
			.catch(function (error) {
				// eslint-disable-next-line no-console
				console.error(LOG_PREFIX, 'open failed', taskId, error);
			});
	}

	function handleCheckboxClick(trigger, event) {
		// Already completed checkboxes are rendered as disabled, but guard anyway.
		if (trigger.dataset.todoqDone === '1') {
			event.preventDefault();
			return;
		}

		var taskId = getTaskId(trigger);
		var taskElement = trigger.closest(SELECTOR_TASK);

		if (!taskId) {
			event.preventDefault();
			// eslint-disable-next-line no-console
			console.warn(LOG_PREFIX, 'checkbox click without', ATTR_TASK_ID);
			return;
		}

		// Prevent the browser from toggling the checkbox until we get confirmation.
		event.preventDefault();
		clearTaskError(taskElement);
		trigger.dataset.todoqDone = '1';
		trigger.disabled = true;

		postMessage({ type: MESSAGE_MARK_DONE, taskId: taskId })
			.then(function (response) {
				if (response && response.ok) {
					markTaskCompletedInDom(taskElement);
					var block = findContainingBlock(trigger);
					if (block) block.setAttribute(ATTR_READY, '0');
					return;
				}
				trigger.dataset.todoqDone = '';
				trigger.disabled = false;
				showTaskError(taskElement, response && response.message);
			})
			.catch(function (error) {
				trigger.dataset.todoqDone = '';
				trigger.disabled = false;
				// eslint-disable-next-line no-console
				console.error(LOG_PREFIX, 'markDone failed', taskId, error);
				showTaskError(taskElement, null);
			});
	}

	function handleClick(event) {
		if (!event.target || typeof event.target.closest !== 'function') return;

		var checkboxTrigger = event.target.closest(SELECTOR_CHECKBOX);
		if (checkboxTrigger) {
			handleCheckboxClick(checkboxTrigger, event);
			return;
		}

		var openTrigger = event.target.closest(SELECTOR_OPEN);
		if (openTrigger) {
			event.preventDefault();
			handleOpenClick(openTrigger);
		}
	}

	if (!document.__todoqClickInstalled) {
		document.addEventListener('click', handleClick);
		document.__todoqClickInstalled = true;
	}

	// Joplin re-renders the preview into the same document. Hydrate any blocks
	// that already exist now, plus those that appear later via re-render.
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', hydrateAllBlocks);
	} else {
		hydrateAllBlocks();
	}

	if (typeof MutationObserver !== 'undefined' && !document.__todoqObserverInstalled) {
		var observer = new MutationObserver(function () {
			hydrateAllBlocks();
		});
		observer.observe(document.body, { childList: true, subtree: true });
		document.__todoqObserverInstalled = true;
	}
})();
