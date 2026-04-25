import * as vscode from "vscode";

import { buildResourceBundle } from "../bundle";
import { showError, writeToClipboard } from "../feedback";
import { extractResourceUris } from "../resources";
import { padContextOutput } from "../settings";

export function registerBundleCommand(
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable {
  return vscode.commands.registerCommand(
    "quickCopy.copyBundle",
    async (primary?: unknown, secondary?: unknown) => {
      const targets = resolveBundleTargets(primary, secondary);
      if (targets.length === 0) {
        await showError("No resources selected");
        return;
      }

      const result = await buildResourceBundle(targets);
      if (result.fileCount === 0) {
        await showError("No files to bundle");
        return;
      }

      const fileWord = result.fileCount === 1 ? "file" : "files";
      const message = result.skipped > 0
        ? `Copied bundle (${result.fileCount} ${fileWord}, ${result.skipped} skipped)`
        : `Copied bundle (${result.fileCount} ${fileWord})`;
      await writeToClipboard(padContextOutput(result.text), message, statusBarFeedback);
    },
  );
}

export function resolveBundleTargets(primary?: unknown, secondary?: unknown): vscode.Uri[] {
  const fromArgs = extractResourceUris(primary, secondary);
  if (fromArgs.length > 0) {
    return fromArgs;
  }

  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.uri.scheme === "file") {
    return [editor.document.uri];
  }

  return [];
}
