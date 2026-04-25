import * as vscode from "vscode";

import { showError, writeToClipboard } from "../feedback";
import { getSelectionContext, SelectionContext } from "../formatters";
import { extractResourceUris } from "../resources";
import { getSettings } from "../settings";

export function registerSelectionCommand(
  command: string,
  formatter: (selection: SelectionContext) => string,
  statusMessage: string,
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable {
  return vscode.commands.registerCommand(command, async () => {
    const editor = vscode.window.activeTextEditor;

    if (editor && editor.selections.length > 1) {
      await showError("Multiple selections are not yet supported");
      return;
    }

    const selection = getSelectionContext(editor, { pathStyle: getSettings().pathStyle });
    if (!selection) {
      await showError("No active selection");
      return;
    }

    await writeToClipboard(formatter(selection), statusMessage, statusBarFeedback);
  });
}

export function registerFileCommand(
  command: string,
  formatter: (uri: vscode.Uri) => string,
  statusMessage: string,
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable {
  return vscode.commands.registerCommand(command, async (primary?: unknown, secondary?: unknown) => {
    const uris = extractResourceUris(primary, secondary);

    if (uris.length > 0) {
      await writeToClipboard(
        uris.map((uri) => formatter(uri)).join("\n"),
        uris.length === 1 ? statusMessage : `${statusMessage} (${uris.length} items)`,
        statusBarFeedback,
      );
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.scheme !== "file") {
      await showError("Current file path is unavailable");
      return;
    }

    await writeToClipboard(formatter(editor.document.uri), statusMessage, statusBarFeedback);
  });
}

export interface DiagnosticFormatterResult {
  readonly text: string;
  readonly count: number;
}

export function registerDiagnosticCommand(
  command: string,
  formatter: (
    uri?: vscode.Uri,
    target?: vscode.Range | vscode.Position,
  ) => Promise<DiagnosticFormatterResult | undefined>,
  statusMessage: string,
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable {
  return vscode.commands.registerCommand(
    command,
    async (uri?: vscode.Uri, target?: vscode.Range | vscode.Position) => {
      const result = await formatter(uri, target);
      if (!result) {
        await showError("No diagnostic found at current position");
        return;
      }

      const message = result.count > 1 ? `${statusMessage} (${result.count})` : statusMessage;
      await writeToClipboard(result.text, message, statusBarFeedback);
    },
  );
}
