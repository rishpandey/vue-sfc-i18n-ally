import * as vscode from 'vscode';
import { getEmptyI18nBlock } from '../core/transformer';
import { insertI18nBlock } from '../core/vueUtils';

export async function insertEmptyI18nBlockCommand() {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.document.languageId !== 'vue') {
    vscode.window.showErrorMessage('This command requires an active Vue file');
    return;
  }

  try {
    // Get empty i18n block
    const i18nBlock = getEmptyI18nBlock();

    // Insert the i18n block
    await insertI18nBlock(editor, i18nBlock);

    vscode.window.showInformationMessage('Empty i18n block added');
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to insert i18n block: ${error.message}`);
  }
}