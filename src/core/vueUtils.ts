import * as vscode from 'vscode';

export async function insertI18nBlock(
  editor: vscode.TextEditor,
  i18nContent: string
): Promise<void> {
  const document = editor.document;
  const text = document.getText();

  // Check if i18n block already exists
  const i18nBlockRegex = /<i18n>[\s\S]*?<\/i18n>/;
  const hasI18nBlock = i18nBlockRegex.test(text);

  if (hasI18nBlock) {
    // Replace existing i18n block
    const edit = new vscode.WorkspaceEdit();
    const range = findI18nBlockRange(document, text);

    if (range) {
      edit.replace(document.uri, range, `<i18n>\n${i18nContent}\n</i18n>`);
      await vscode.workspace.applyEdit(edit);
      return;
    }
  }

  // Insert new i18n block at the end of file
  const edit = new vscode.WorkspaceEdit();
  const lastLine = document.lineCount - 1;
  const lastPos = new vscode.Position(lastLine, document.lineAt(lastLine).text.length);

  edit.insert(document.uri, lastPos, `\n\n<i18n>\n${i18nContent}\n</i18n>\n`);
  await vscode.workspace.applyEdit(edit);
}

function findI18nBlockRange(
  document: vscode.TextDocument,
  text: string
): vscode.Range | null {
  const match = text.match(/<i18n>[\s\S]*?<\/i18n>/);

  if (!match) {
    return null;
  }

  const startIdx = match.index || 0;
  const endIdx = startIdx + match[0].length;

  const startPos = document.positionAt(startIdx);
  const endPos = document.positionAt(endIdx);

  return new vscode.Range(startPos, endPos);
}