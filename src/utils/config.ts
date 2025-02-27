import * as vscode from 'vscode';

export function getConfig() {
  const config = vscode.workspace.getConfiguration('vue-sfc-i18n-ally');

  return {
    defaultLocale: config.get<string>('defaultLocale') || 'en',
    additionalLocales: config.get<string[]>('additionalLocales') || ['ja'],
  };
}