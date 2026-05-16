export interface AppLocalization {
	// Commands / menu
	refreshQueriesCommandLabel: string;

	// Block placeholders
	loadingTasks: string;
	emptyQuery: string;

	// Renderer
	headerLabel: string;
	emptyStateText: string;
	noNotebookLabel: string;
	untitledTask: string;

	// Date labels
	dueToday: string;
	dueTomorrow: string;
	dueYesterday: string;

	// Error titles & runtime errors
	errorTitle: string;
	parseErrorTitle: string;
	runtimeErrorTitle: string;
	parseErrorLine: string;
	failedToRenderQuery: string;
	failedToOpenTask: string;
	failedToMarkDone: string;
	failedToLoadTasks: string;
	invalidQueryEncoding: string;
	missingTaskId: string;

	// Parser: dispatcher
	parserUnknownCommand: string;

	// Parser: status
	parserExpectedStatus: string;
	parserInvalidStatus: string;

	// Parser: due
	parserExpectedDue: string;
	parserInvalidDueValue: string;
	parserInvalidRangeStartBracket: string;
	parserInvalidRangeEndBracket: string;
	parserExpectedRangeExpression: string;
	parserRangeSyntaxNoComma: string;
	parserRangeSyntaxMultipleCommas: string;
	parserRangeSyntaxEmptyStart: string;
	parserRangeSyntaxEmptyEnd: string;
	parserInvalidRangeStart: string;
	parserInvalidRangeEnd: string;

	// Parser: limit
	parserExpectedLimit: string;
	parserInvalidLimit: string;
	parserLimitTooLarge: string;

	// Parser: notebook
	parserExpectedNotebookName: string;
	parserExpectedNotebookNameAfterUnder: string;
	parserNotebookNameEmpty: string;

	// Parser: search
	parserSearchTextEmpty: string;

	// Parser: title
	parserTitleEmpty: string;

	// Parser: sort
	parserSortSyntax: string;
	parserInvalidSortField: string;
	parserInvalidSortDirection: string;

	// Parser: view
	parserExpectedView: string;
	parserUnsupportedView: string;
	parserListViewExtraArgs: string;
	parserCustomViewRequiresFields: string;
	parserViewFieldsEmpty: string;
	parserInvalidViewField: string;

	// Parser: tag
	parserExpectedAtLeastOneTag: string;
	parserTagListEmpty: string;
	parserTagListContainsEmptyTag: string;
	parserTagContainsWhitespace: string;

	// Parser: date expression
	parserUnsupportedDateAnchor: string;
	parserUnsupportedOffsetUnit: string;
	parserInvalidOffsetAmount: string;
	parserExpectedDateExpression: string;
	parserInvalidDateExpression: string;

	// Parser: quoted strings
	parserExpectedValue: string;
	parserMustEndWithQuote: string;
	parserUnexpectedTextAfter: string;
	parserContainsSpaces: string;
	parserMustBeQuoted: string;

	// Parser: value labels (used inside parserExpectedValue / parserMustBeQuoted etc.)
	parserLabelNotebookName: string;
	parserLabelSearchText: string;
	parserLabelTitle: string;

	// Settings
	settingsSectionLabel: string;
	settingDateFormatLabel: string;
	settingDateFormatDescription: string;
}

const PLACEHOLDER_PATTERN = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

const defaultStrings: AppLocalization = {
	refreshQueriesCommandLabel: 'TodoQ: Refresh Queries',

	loadingTasks: 'Loading tasks…',
	emptyQuery: 'Empty TodoQ query',

	headerLabel: 'TodoQ',
	emptyStateText: 'No tasks matched this TodoQ query.',
	noNotebookLabel: '—',
	untitledTask: '(untitled)',

	dueToday: 'Today',
	dueTomorrow: 'Tomorrow',
	dueYesterday: 'Yesterday',

	errorTitle: 'TodoQ error:',
	parseErrorTitle: 'TodoQ query error:',
	runtimeErrorTitle: 'TodoQ runtime error:',
	parseErrorLine: 'Line {{line}}: {{message}}',
	failedToRenderQuery: 'Failed to render TodoQ query',
	failedToOpenTask: 'Failed to open task',
	failedToMarkDone: 'Failed to mark task done',
	failedToLoadTasks: 'Failed to load TodoQ tasks',
	invalidQueryEncoding: 'Invalid query encoding',
	missingTaskId: 'Missing task id',

	parserUnknownCommand: 'Unknown command "{{command}}".',

	parserExpectedStatus: 'Expected status value. Expected: open, done, all.',
	parserInvalidStatus: 'Invalid status "{{value}}". Expected: open, done, all.',

	parserExpectedDue: 'Expected due filter. Supported examples: due any, due today, due before today, due range [today, today + 3d].',
	parserInvalidDueValue: 'Invalid due value "{{value}}". Expected: any, none, overdue, today, tomorrow, yesterday, week, <date>, before <date>, after <date>, range <interval>.',
	parserInvalidRangeStartBracket: 'Invalid range start bracket. Use "[" for inclusive or "(" for exclusive start.',
	parserInvalidRangeEndBracket: 'Invalid range end bracket. Use "]" for inclusive or ")" for exclusive end.',
	parserExpectedRangeExpression: 'Expected range expression, for example: due range [today, today + 3d].',
	parserRangeSyntaxNoComma: 'Invalid range syntax. Expected comma between start and end date expressions.',
	parserRangeSyntaxMultipleCommas: 'Invalid range syntax. Expected exactly one comma between start and end date expressions.',
	parserRangeSyntaxEmptyStart: 'Invalid range syntax. Start date expression is empty.',
	parserRangeSyntaxEmptyEnd: 'Invalid range syntax. End date expression is empty.',
	parserInvalidRangeStart: 'Invalid range start: {{message}}',
	parserInvalidRangeEnd: 'Invalid range end: {{message}}',

	parserExpectedLimit: 'Expected limit value. Limit must be a positive integer.',
	parserInvalidLimit: 'Invalid limit "{{value}}". Limit must be a positive integer.',
	parserLimitTooLarge: 'Invalid limit "{{value}}". Limit is too large.',

	parserExpectedNotebookName: 'Expected notebook name.',
	parserExpectedNotebookNameAfterUnder: 'Expected notebook name after "under".',
	parserNotebookNameEmpty: 'Notebook name cannot be empty.',

	parserSearchTextEmpty: 'Search text cannot be empty.',

	parserTitleEmpty: 'Title cannot be empty.',

	parserSortSyntax: 'Expected sort <field> <direction>, for example: sort due asc.',
	parserInvalidSortField: 'Invalid sort field "{{value}}". Expected: due, title, created, updated.',
	parserInvalidSortDirection: 'Invalid sort direction "{{value}}". Expected: asc, desc.',

	parserExpectedView: 'Expected view value. Supported: list, custom <fields>.',
	parserUnsupportedView: 'Unsupported view "{{value}}". Supported: list, custom <fields>.',
	parserListViewExtraArgs: 'View "list" does not accept arguments, got: "{{value}}".',
	parserCustomViewRequiresFields: 'View "custom" requires a comma-separated list of fields. Supported fields: due, tags, path.',
	parserViewFieldsEmpty: 'View field list contains an empty field.',
	parserInvalidViewField: 'Invalid view field "{{value}}". Supported fields: due, tags, path.',

	parserExpectedAtLeastOneTag: 'Expected at least one tag.',
	parserTagListEmpty: 'Tag list cannot be empty.',
	parserTagListContainsEmptyTag: 'Tag list contains an empty tag.',
	parserTagContainsWhitespace: 'Tag "{{value}}" contains whitespace. Separate tags with commas.',

	parserUnsupportedDateAnchor: 'Unsupported date anchor "{{value}}". Supported anchors: today, tomorrow, yesterday, {{format}}.',
	parserUnsupportedOffsetUnit: 'Unsupported date offset unit "{{value}}". Supported units: days, weeks.',
	parserInvalidOffsetAmount: 'Invalid date offset amount "{{value}}". Offset amount must be a positive integer.',
	parserExpectedDateExpression: 'Expected date expression.',
	parserInvalidDateExpression: 'Invalid date expression "{{value}}". Expected today, tomorrow, yesterday, {{format}}, with optional offset like "+ 3d".',

	parserExpectedValue: 'Expected {{name}}.',
	parserMustEndWithQuote: '{{name}} must end with a double quote.',
	parserUnexpectedTextAfter: 'Unexpected text after {{name}}.',
	parserContainsSpaces: '{{name}} contains spaces and must be wrapped in double quotes.',
	parserMustBeQuoted: '{{name}} must be wrapped in double quotes.',

	parserLabelNotebookName: 'notebook name',
	parserLabelSearchText: 'search text',
	parserLabelTitle: 'title',

	settingsSectionLabel: 'TodoQ',
	settingDateFormatLabel: 'Date format for <date-expr>',
	settingDateFormatDescription: 'Format used to parse literal dates inside TodoQ queries. Supported tokens: YYYY, YY, MM, M, DD, D. Example: YYYY-MM-DD, DD.MM.YYYY.',
};

const localizations: Record<string, Partial<AppLocalization>> = {
	ru: {
		refreshQueriesCommandLabel: 'TodoQ: Обновить запросы',

		loadingTasks: 'Загрузка задач…',
		emptyQuery: 'Пустой TodoQ-запрос',

		headerLabel: 'TodoQ',
		emptyStateText: 'Нет задач, соответствующих этому TodoQ-запросу.',
		noNotebookLabel: '—',
		untitledTask: '(без названия)',

		dueToday: 'Сегодня',
		dueTomorrow: 'Завтра',
		dueYesterday: 'Вчера',

		errorTitle: 'Ошибка TodoQ:',
		parseErrorTitle: 'Ошибка TodoQ-запроса:',
		runtimeErrorTitle: 'Ошибка выполнения TodoQ:',
		parseErrorLine: 'Строка {{line}}: {{message}}',
		failedToRenderQuery: 'Не удалось выполнить TodoQ-запрос',
		failedToOpenTask: 'Не удалось открыть задачу',
		failedToMarkDone: 'Не удалось отметить задачу выполненной',
		failedToLoadTasks: 'Не удалось загрузить задачи TodoQ',
		invalidQueryEncoding: 'Некорректная кодировка запроса',
		missingTaskId: 'Отсутствует идентификатор задачи',

		parserUnknownCommand: 'Неизвестная команда "{{command}}".',

		parserExpectedStatus: 'Ожидалось значение status. Допустимые: open, done, all.',
		parserInvalidStatus: 'Недопустимый status "{{value}}". Допустимые: open, done, all.',

		parserExpectedDue: 'Ожидался фильтр due. Примеры: due any, due today, due before today, due range [today, today + 3d].',
		parserInvalidDueValue: 'Недопустимое значение due "{{value}}". Допустимые: any, none, overdue, today, tomorrow, yesterday, week, <date>, before <date>, after <date>, range <interval>.',
		parserInvalidRangeStartBracket: 'Недопустимая открывающая скобка диапазона. Используйте "[" для включающей или "(" для исключающей границы.',
		parserInvalidRangeEndBracket: 'Недопустимая закрывающая скобка диапазона. Используйте "]" для включающей или ")" для исключающей границы.',
		parserExpectedRangeExpression: 'Ожидалось выражение диапазона, например: due range [today, today + 3d].',
		parserRangeSyntaxNoComma: 'Некорректный синтаксис диапазона. Ожидалась запятая между началом и концом.',
		parserRangeSyntaxMultipleCommas: 'Некорректный синтаксис диапазона. Должна быть ровно одна запятая между началом и концом.',
		parserRangeSyntaxEmptyStart: 'Некорректный синтаксис диапазона. Пустое начальное выражение даты.',
		parserRangeSyntaxEmptyEnd: 'Некорректный синтаксис диапазона. Пустое конечное выражение даты.',
		parserInvalidRangeStart: 'Некорректное начало диапазона: {{message}}',
		parserInvalidRangeEnd: 'Некорректный конец диапазона: {{message}}',

		parserExpectedLimit: 'Ожидалось значение limit. Должно быть положительным целым числом.',
		parserInvalidLimit: 'Недопустимое значение limit "{{value}}". Должно быть положительным целым числом.',
		parserLimitTooLarge: 'Недопустимое значение limit "{{value}}". Значение слишком велико.',

		parserExpectedNotebookName: 'Ожидалось название блокнота.',
		parserExpectedNotebookNameAfterUnder: 'Ожидалось название блокнота после "under".',
		parserNotebookNameEmpty: 'Название блокнота не может быть пустым.',

		parserSearchTextEmpty: 'Текст поиска не может быть пустым.',

		parserTitleEmpty: 'Заголовок не может быть пустым.',

		parserSortSyntax: 'Ожидался формат: sort <поле> <направление>, например: sort due asc.',
		parserInvalidSortField: 'Недопустимое поле сортировки "{{value}}". Допустимые: due, title, created, updated.',
		parserInvalidSortDirection: 'Недопустимое направление сортировки "{{value}}". Допустимые: asc, desc.',

		parserExpectedView: 'Ожидалось значение view. Допустимые: list, custom <поля>.',
		parserUnsupportedView: 'Неподдерживаемое значение view "{{value}}". Допустимые: list, custom <поля>.',
		parserListViewExtraArgs: 'View "list" не принимает аргументы, получено: "{{value}}".',
		parserCustomViewRequiresFields: 'View "custom" требует список полей через запятую. Допустимые поля: due, tags, path.',
		parserViewFieldsEmpty: 'Список полей view содержит пустое поле.',
		parserInvalidViewField: 'Недопустимое поле view "{{value}}". Допустимые поля: due, tags, path.',

		parserExpectedAtLeastOneTag: 'Ожидался хотя бы один тег.',
		parserTagListEmpty: 'Список тегов не может быть пустым.',
		parserTagListContainsEmptyTag: 'Список тегов содержит пустой тег.',
		parserTagContainsWhitespace: 'Тег "{{value}}" содержит пробелы. Разделяйте теги запятыми.',

		parserUnsupportedDateAnchor: 'Неподдерживаемая опорная дата "{{value}}". Допустимые: today, tomorrow, yesterday, {{format}}.',
		parserUnsupportedOffsetUnit: 'Неподдерживаемая единица смещения "{{value}}". Допустимые: days, weeks.',
		parserInvalidOffsetAmount: 'Недопустимая величина смещения "{{value}}". Должна быть положительным целым числом.',
		parserExpectedDateExpression: 'Ожидалось выражение даты.',
		parserInvalidDateExpression: 'Некорректное выражение даты "{{value}}". Ожидалось today, tomorrow, yesterday, {{format}}, с опциональным смещением вида "+ 3d".',

		parserExpectedValue: 'Ожидалось значение: {{name}}.',
		parserMustEndWithQuote: '{{name}}: ожидалась закрывающая двойная кавычка.',
		parserUnexpectedTextAfter: 'Лишний текст после: {{name}}.',
		parserContainsSpaces: '{{name}}: содержит пробелы и должно быть в двойных кавычках.',
		parserMustBeQuoted: '{{name}}: значение должно быть в двойных кавычках.',

		parserLabelNotebookName: 'название блокнота',
		parserLabelSearchText: 'текст поиска',
		parserLabelTitle: 'заголовок',

		settingsSectionLabel: 'TodoQ',
		settingDateFormatLabel: 'Формат даты для <date-expr>',
		settingDateFormatDescription: 'Формат, в котором разбираются литералы дат в TodoQ-запросах. Поддерживаемые токены: YYYY, YY, MM, M, DD, D. Пример: YYYY-MM-DD, DD.MM.YYYY.',
	},
};

let supportedLanguages: string[] = [];

const strings: AppLocalization = { ...defaultStrings };

const getNavigatorLanguages = (): readonly string[] => {
	if (typeof navigator === 'undefined') {
		return [];
	}

	if (navigator.languages?.length > 0) {
		return navigator.languages;
	}

	return navigator.language ? [navigator.language] : [];
};

const normalizeLocale = (locale: string): string => locale.replace('_', '-');

const getLanguageCode = (locale: string): string | undefined => {
	const localeSeparatorIndex = locale.indexOf('-');

	return localeSeparatorIndex === -1 ? undefined : locale.substring(0, localeSeparatorIndex);
};

const getSupportedLanguages = (locales: readonly string[]): string[] => {
	const languages: string[] = [];

	for (const locale of locales) {
		const normalizedLocale = normalizeLocale(locale);
		languages.push(normalizedLocale);

		const languageCode = getLanguageCode(normalizedLocale);

		if (languageCode) {
			languages.push(languageCode);
		}
	}

	return languages;
};

const findLocalization = (languages: readonly string[]): Partial<AppLocalization> => {
	for (const language of languages) {
		const localization = localizations[language];

		if (localization) {
			return localization;
		}
	}

	return {};
};

const applyLocalization = (localization: Partial<AppLocalization>) => {
	Object.assign(strings, defaultStrings, localization);
};

export const setLocale = (supportedLocales: readonly string[] | string) => {
	const locales = typeof supportedLocales === 'string' ? [supportedLocales] : supportedLocales;
	const languages = getSupportedLanguages(locales);

	supportedLanguages = languages;
	applyLocalization(findLocalization(languages));
};

setLocale(getNavigatorLanguages());

export const getLocales = () => {
	return [...supportedLanguages];
};

export const formatLocalizedString = (
	template: string,
	values: Record<string, string | number>,
): string => {
	return template.replace(PLACEHOLDER_PATTERN, (match, key: string) => {
		const value = values[key];
		return value === undefined ? match : String(value);
	});
};

export default strings;
