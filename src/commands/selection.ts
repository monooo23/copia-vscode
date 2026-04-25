import * as vscode from "vscode";

import {
  formatCopyContext,
  formatPathWithLines,
  formatPathWithLinesAndChars,
} from "../formatters";
import { getReferenceOutputOptions, getSettings } from "../settings";
import { registerSelectionCommand } from "./register";

export function registerSelectionCommands(
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable[] {
  return [
    registerSelectionCommand(
      "quickCopy.copySelection",
      (selection) => selection.selectedText,
      "Copied selection",
      statusBarFeedback,
    ),
    registerSelectionCommand(
      "quickCopy.copyPathWithLines",
      (selection) => formatPathWithLines(selection, getReferenceOutputOptions()),
      "Copied file path with line range",
      statusBarFeedback,
    ),
    registerSelectionCommand(
      "quickCopy.copyPathWithLinesAndChars",
      (selection) => formatPathWithLinesAndChars(selection, getReferenceOutputOptions()),
      "Copied file path with line and char range",
      statusBarFeedback,
    ),
    registerSelectionCommand(
      "quickCopy.copyContext",
      (selection) =>
        formatCopyContext(selection, {
          maxLines: getSettings().maxCodeLines,
          ...getReferenceOutputOptions(),
        }),
      "Copied selection context",
      statusBarFeedback,
    ),
  ];
}
