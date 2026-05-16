import joplin from 'api';
import { SettingItemType } from 'api/types';

import strings from './i18n/strings';

export const TODOQ_SETTINGS_SECTION = 'todoq';
export const TODOQ_SETTING_DATE_FORMAT = 'todoq.dateFormat';
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

let cachedDateFormat = DEFAULT_DATE_FORMAT;

export function getDateFormat(): string {
	return cachedDateFormat;
}

function normalizeDateFormat(value: unknown): string {
	if (typeof value !== 'string') return DEFAULT_DATE_FORMAT;
	const trimmed = value.trim();
	return trimmed || DEFAULT_DATE_FORMAT;
}

export async function registerTodoQSettings(onDateFormatChange: () => void | Promise<void>): Promise<void> {
	await joplin.settings.registerSection(TODOQ_SETTINGS_SECTION, {
		label: strings.settingsSectionLabel,
		iconName: 'fas fa-check-square',
	});

	await joplin.settings.registerSettings({
		[TODOQ_SETTING_DATE_FORMAT]: {
			value: DEFAULT_DATE_FORMAT,
			type: SettingItemType.String,
			section: TODOQ_SETTINGS_SECTION,
			public: true,
			label: strings.settingDateFormatLabel,
			description: strings.settingDateFormatDescription,
		},
	});

	cachedDateFormat = normalizeDateFormat(await joplin.settings.value(TODOQ_SETTING_DATE_FORMAT));

	await joplin.settings.onChange(async event => {
		if (!event.keys.includes(TODOQ_SETTING_DATE_FORMAT)) return;
		cachedDateFormat = normalizeDateFormat(await joplin.settings.value(TODOQ_SETTING_DATE_FORMAT));
		await onDateFormatChange();
	});
}
