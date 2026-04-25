import * as path from "node:path";
import * as vscode from "vscode";

import { buildResourceBundle } from "../bundle";
import { showCopyFeedback, showError, writeToClipboard } from "../feedback";
import { formatCopyContext, getSelectionContext, SelectionContext } from "../formatters";
import { getReferenceOutputOptions, getSettings, padContextOutput } from "../settings";
import { showStageQuickPick, StageManager, StagedItem } from "../stage";
import { getEnclosingSymbol } from "../symbol";
import { resolveBundleTargets } from "./bundle";

export function registerStageCommands(
  stage: StageManager,
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand("quickCopy.stageAdd", async () => {
      const item = await buildStageItemFromActiveEditor();
      if (!item) {
        return;
      }
      stage.add(item);
      showCopyFeedback(statusBarFeedback, `Staged ${item.description ?? "item"} (${stage.count()})`);
    }),
    vscode.commands.registerCommand("quickCopy.stageAddEnclosingSymbol", async () => {
      const item = await buildStageItemFromEnclosingSymbol();
      if (!item) {
        return;
      }
      stage.add(item);
      showCopyFeedback(statusBarFeedback, `Staged symbol (${stage.count()})`);
    }),
    vscode.commands.registerCommand(
      "quickCopy.stageAddFiles",
      async (primary?: unknown, secondary?: unknown) => {
        const targets = resolveBundleTargets(primary, secondary);
        if (targets.length === 0) {
          await showError("No resources selected");
          return;
        }

        const result = await buildResourceBundle(targets);
        if (result.fileCount === 0) {
          await showError("No files to stage");
          return;
        }

        const label = targets.length === 1
          ? `$(file) ${path.basename(targets[0]!.fsPath)}`
          : `$(files) ${result.fileCount} file${result.fileCount === 1 ? "" : "s"}`;

        stage.add({
          label,
          description: result.fileCount === 1 ? "File" : "Files",
          detail: targets.map((uri) => uri.fsPath).join("\n"),
          content: result.text,
        });
        showCopyFeedback(
          statusBarFeedback,
          `Staged ${result.fileCount} file${result.fileCount === 1 ? "" : "s"} (${stage.count()})`,
        );
      },
    ),
    vscode.commands.registerCommand("quickCopy.stageCopy", async () => {
      if (stage.count() === 0) {
        await showError("Copia stage is empty");
        return;
      }
      const text = padContextOutput(stage.bundle());
      await writeToClipboard(
        text,
        `Copied stage (${stage.count()} item${stage.count() === 1 ? "" : "s"})`,
        statusBarFeedback,
      );
    }),
    vscode.commands.registerCommand("quickCopy.stageClear", () => {
      const previousCount = stage.count();
      stage.clear();
      if (previousCount > 0) {
        showCopyFeedback(statusBarFeedback, "Cleared stage");
      }
    }),
    vscode.commands.registerCommand("quickCopy.stageManage", () => showStageQuickPick(stage)),
  ];
}

async function buildStageItemFromActiveEditor(): Promise<Omit<StagedItem, "id"> | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    await showError("No active editor");
    return undefined;
  }

  const selection = getSelectionContext(editor, { pathStyle: getSettings().pathStyle });
  if (selection) {
    const fileName = path.basename(editor.document.uri.fsPath);
    const range = selection.startLine === selection.endLine
      ? `${selection.startLine}`
      : `${selection.startLine}-${selection.endLine}`;
    return {
      label: `$(symbol-string) ${fileName}:${range}`,
      description: "Selection",
      content: renderBareContext(selection),
    };
  }

  if (editor.document.uri.scheme !== "file") {
    await showError("Current file path is unavailable");
    return undefined;
  }

  const result = await buildResourceBundle([editor.document.uri]);
  if (result.fileCount === 0) {
    await showError("Unable to read current file");
    return undefined;
  }
  return {
    label: `$(file) ${path.basename(editor.document.uri.fsPath)}`,
    description: "File",
    content: result.text,
  };
}

async function buildStageItemFromEnclosingSymbol(): Promise<Omit<StagedItem, "id"> | undefined> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    await showError("No active editor");
    return undefined;
  }

  const enclosing = await getEnclosingSymbol(editor);
  if (!enclosing) {
    await showError("No enclosing symbol found");
    return undefined;
  }

  return {
    label: `$(symbol-method) ${enclosing.symbol.name}`,
    description: "Symbol",
    detail: `${path.basename(editor.document.uri.fsPath)}:${enclosing.context.startLine}-${enclosing.context.endLine}`,
    content: renderBareContext(enclosing.context),
  };
}

function renderBareContext(selection: SelectionContext): string {
  return formatCopyContext(selection, {
    maxLines: getSettings().maxCodeLines,
    ...getReferenceOutputOptions(),
    surroundWithBlankLines: false,
  });
}
