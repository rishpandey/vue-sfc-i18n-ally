import * as vscode from 'vscode';
import { extractStringsCommand } from './commands/extractStrings';
import { insertEmptyI18nBlockCommand } from './commands/insertI18nBlock';

export function activate(context: vscode.ExtensionContext) {
  console.log('Vue SFC i18n Ally extension is now active!');

  // Register commands
  const extractStringsDisposable = vscode.commands.registerCommand(
    'vue-sfc-i18n-ally.extractStrings',
    extractStringsCommand
  );

  const insertEmptyI18nBlockDisposable = vscode.commands.registerCommand(
    'vue-sfc-i18n-ally.insertEmptyI18nBlock',
    insertEmptyI18nBlockCommand
  );

  context.subscriptions.push(extractStringsDisposable);
  context.subscriptions.push(insertEmptyI18nBlockDisposable);
}

export function deactivate() {}