import * as vscode from 'vscode';

interface StringMatch {
  text: string;
  location: vscode.Range;
  key?: string;
}

interface ParseResult {
  templateStrings: StringMatch[];
  existingI18n: Record<string, Record<string, string>> | null;
}

export async function parseVueFile(document: vscode.TextDocument): Promise<ParseResult> {
  const vueContent = document.getText();

  // Simple regex to extract strings from template
  const templateMatch = vueContent.match(/<template>([\s\S]*?)<\/template>/);

  if (!templateMatch) {
    return { templateStrings: [], existingI18n: null };
  }

  const templateContent = templateMatch[1];
  const templateStart = vueContent.indexOf(templateContent);
  const strings: StringMatch[] = [];

  // Find text inside elements - very basic implementation
  const textRegex = />([^<>]+)</g;
  let match;

  while ((match = textRegex.exec(templateContent)) !== null) {
    const text = match[1].trim();
    if (text && !/^\s*{{\s*.*\s*}}\s*$/.test(text)) { // Skip empty strings and interpolated expressions
      // Calculate proper position in the document
      const startOffset = templateStart + match.index + 1;
      const startPos = document.positionAt(startOffset);
      const endPos = document.positionAt(startOffset + match[1].length);

      strings.push({
        text,
        location: new vscode.Range(startPos, endPos)
      });
    }
  }

  // Check for existing i18n block
  const i18nMatch = vueContent.match(/<i18n>([\s\S]*?)<\/i18n>/);
  let existingI18n: Record<string, Record<string, string>> | null = null;

  if (i18nMatch) {
    try {
      existingI18n = JSON.parse(i18nMatch[1].trim());
    } catch (e) {
      console.error('Failed to parse existing i18n block', e);
    }
  }

  return { templateStrings: strings, existingI18n };
}