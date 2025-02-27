import * as vscode from 'vscode';

interface StringMatch {
  text: string;
  location: vscode.Range;
  key?: string;
}

export function getEmptyI18nBlock(): string {
  const config = vscode.workspace.getConfiguration('vue-sfc-i18n-ally');
  const defaultLocale = config.get<string>('defaultLocale') || 'en';
  const additionalLocales = config.get<string[]>('additionalLocales') || ['ja'];

  const locales = [defaultLocale, ...additionalLocales];
  const i18nData: Record<string, Record<string, string>> = {};

  locales.forEach(locale => {
    i18nData[locale] = {
      // Add a sample key
      "hello": locale === 'en' ? 'hello world!' :
               locale === 'ja' ? 'こんにちは、世界！' : `hello world (${locale})`
    };
  });

  return JSON.stringify(i18nData, null, 2);
}

// Function to create a slug from a string
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '')  // Remove leading/trailing hyphens
    .substring(0, 30);        // Limit length
}

export async function transformToI18n(
  strings: StringMatch[],
  existingI18n: Record<string, Record<string, string>> | null
): Promise<string> {
  const config = vscode.workspace.getConfiguration('vue-sfc-i18n-ally');
  const defaultLocale = config.get<string>('defaultLocale') || 'en';
  const additionalLocales = config.get<string[]>('additionalLocales') || ['ja'];

  // Start with existing i18n or create new object
  const i18nData: Record<string, Record<string, string>> = existingI18n || {};

  // Initialize locales if they don't exist
  [defaultLocale, ...additionalLocales].forEach(locale => {
    if (!i18nData[locale]) {
      i18nData[locale] = {};
    }
  });

  // Generate a unique set of keys using slugs
  const usedKeys = new Set(
    Object.values(i18nData)
      .flatMap(localeData => Object.keys(localeData))
  );

  // Add strings to i18n data
  strings.forEach(str => {
    let baseKey = createSlug(str.text);

    // Ensure uniqueness
    let key = baseKey;
    let counter = 1;
    while (usedKeys.has(key)) {
      key = `${baseKey}-${counter}`;
      counter++;
    }

    usedKeys.add(key);
    str.key = key; // Store the key for template replacement

    // Add to default locale
    i18nData[defaultLocale][key] = str.text;

    // Add placeholders for other locales if they don't exist
    additionalLocales.forEach(locale => {
      if (!i18nData[locale][key]) {
        i18nData[locale][key] = str.text;
      }
    });
  });

  return JSON.stringify(i18nData, null, 2);
}