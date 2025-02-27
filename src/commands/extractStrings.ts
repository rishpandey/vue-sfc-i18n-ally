import * as vscode from 'vscode';
import { parseVueFile } from '../core/parser';
import { transformToI18n } from '../core/transformer';
import { insertI18nBlock } from '../core/vueUtils';

export async function extractStringsCommand() {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.document.languageId !== 'vue') {
    vscode.window.showErrorMessage('This command requires an active Vue file');
    return;
  }

  try {
    // Parse the Vue file
    const { templateStrings, existingI18n } = await parseVueFile(editor.document);

    if (templateStrings.length === 0) {
      vscode.window.showInformationMessage('No extractable strings found in this Vue file');
      return;
    }

    // Transform the strings to i18n format
    const i18nBlock = await transformToI18n(templateStrings, existingI18n);

    // Replace the original strings with {{ t('key') }}
    const edit = new vscode.WorkspaceEdit();
    // Sort by reverse order of position to avoid range shifting
    const sortedStrings = [...templateStrings].sort((a, b) =>
      b.location.start.compareTo(a.location.start)
    );

    for (const str of sortedStrings) {
      if (str.key) {
        edit.replace(
          editor.document.uri,
          str.location,
          `{{ t('${str.key}') }}`
        );
      }
    }

    // Apply the edits
    await vscode.workspace.applyEdit(edit);

    // Insert/update the i18n block
    await insertI18nBlock(editor, i18nBlock);

    vscode.window.showInformationMessage('Successfully extracted strings to i18n block');
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to extract strings: ${error.message}`);
  }
}