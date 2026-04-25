import * as vscode from "vscode";

import { hasDiagnosticAtCursor } from "./diagnostics";
import { isSingleNonEmptySelection } from "./formatters";

const KEYS = {
  canCopySelectionContext: "quickCopy.canCopySelectionContext",
  canCopyDiagnosticContext: "quickCopy.canCopyDiagnosticContext",
} as const;

interface ContextState {
  readonly canCopySelection: boolean;
  readonly canCopyDiagnostic: boolean;
}

let lastState: ContextState | undefined;

export async function updateContextKeys(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const canCopySelection = isSingleNonEmptySelection(editor);
  const canCopyDiagnostic = hasDiagnosticAtCursor(editor);

  if (lastState?.canCopySelection !== canCopySelection) {
    await vscode.commands.executeCommand("setContext", KEYS.canCopySelectionContext, canCopySelection);
  }

  if (lastState?.canCopyDiagnostic !== canCopyDiagnostic) {
    await vscode.commands.executeCommand("setContext", KEYS.canCopyDiagnosticContext, canCopyDiagnostic);
  }

  lastState = { canCopySelection, canCopyDiagnostic };
}
