import * as vscode from "vscode";

import { showError, writeToClipboard } from "../feedback";
import {
  formatCopyContext,
  formatPathWithLines,
  formatPathWithLinesAndChars,
  formatPathWithSingleLine,
  getActiveReferenceContext,
  SelectionContext,
} from "../formatters";
import {
  getReferenceOutputOptions,
  getSettings,
  QuickCopyActiveMode,
} from "../settings";

export function registerQuickActiveCommand(
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable {
  return vscode.commands.registerCommand("quickCopy.quickCopyActiveReference", async () => {
    const editor = vscode.window.activeTextEditor;

    if (editor && editor.selections.length > 1) {
      await showError("Multiple selections are not yet supported");
      return;
    }

    const settings = getSettings();
    const active = getActiveReferenceContext(editor, { pathStyle: settings.pathStyle });
    if (!active) {
      await showError("No active file reference");
      return;
    }

    const text = renderActiveReference(active, settings.quickCopyActiveMode, settings.maxCodeLines);
    await writeToClipboard(text, "Copied active reference", statusBarFeedback);
  });
}

function renderActiveReference(
  selection: SelectionContext,
  mode: QuickCopyActiveMode,
  maxCodeLines: number,
): string {
  const referenceOptions = getReferenceOutputOptions();

  switch (mode) {
    case "singleLine":
      return formatPathWithSingleLine(selection, referenceOptions);
    case "lineRange":
      return formatPathWithLines(selection, referenceOptions);
    case "charRange":
      return formatPathWithLinesAndChars(selection, referenceOptions);
    case "context":
      return formatCopyContext(selection, { maxLines: maxCodeLines, ...referenceOptions });
    default:
      return formatPathWithLines(selection, referenceOptions);
  }
}
