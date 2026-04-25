import * as vscode from "vscode";

import { showError, writeToClipboard } from "../feedback";
import { formatCopyContext } from "../formatters";
import { getReferenceOutputOptions, getSettings } from "../settings";
import { getEnclosingSymbol } from "../symbol";

export function registerSymbolCommand(
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable {
  return vscode.commands.registerCommand("quickCopy.copyEnclosingSymbol", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      await showError("No active editor");
      return;
    }

    const enclosing = await getEnclosingSymbol(editor);
    if (!enclosing) {
      await showError("No enclosing symbol found");
      return;
    }

    const text = formatCopyContext(enclosing.context, {
      maxLines: getSettings().maxCodeLines,
      ...getReferenceOutputOptions(),
    });
    await writeToClipboard(text, "Copied enclosing symbol", statusBarFeedback);
  });
}
