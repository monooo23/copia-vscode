import * as vscode from "vscode";
import * as path from "node:path";

import { QuickCopyCodeLensProvider } from "./codelens";
import {
  clearDiagnosticCodeLensCache,
  copyDiagnosticContext,
  copyDiagnosticContextWithCode,
  hasDiagnosticAtCursor,
  QuickCopyCodeActionProvider,
} from "./diagnostics";
import {
  formatCopyContext,
  formatPath,
  formatPathWithSingleLine,
  formatPathWithLines,
  formatPathWithLinesAndChars,
  getActiveReferenceContext,
  getSelectionContext,
  isSingleNonEmptySelection,
  SelectionContext,
} from "./formatters";
import { extractResourceUris } from "./resources";
import { getSettings, shouldRefreshConfiguration } from "./settings";

const EXTENSION_CONTEXT_KEYS = {
  canCopySelectionContext: "quickCopy.canCopySelectionContext",
  canCopyDiagnosticContext: "quickCopy.canCopyDiagnosticContext",
} as const;

export function activate(context: vscode.ExtensionContext): void {
  const codeLensProvider = new QuickCopyCodeLensProvider();
  const statusBarFeedback = createStatusBarFeedback();
  const scheduleUiRefresh = createDebouncedUiRefresh(codeLensProvider);

  context.subscriptions.push(
    statusBarFeedback,
    registerFileCommand("quickCopy.copyFileName", (uri) => path.basename(uri.fsPath), "Copied file name", statusBarFeedback),
    registerFileCommand(
      "quickCopy.copyRelativePath",
      (uri) => formatPath(uri, getPathOutputOptions("workspaceRelative")),
      "Copied relative path",
      statusBarFeedback,
    ),
    registerFileCommand(
      "quickCopy.copyAbsolutePath",
      (uri) => formatPath(uri, getPathOutputOptions("absolute")),
      "Copied absolute path",
      statusBarFeedback,
    ),
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
      (selection) => formatCopyContext(selection, { maxLines: getSettings().maxCodeLines, ...getReferenceOutputOptions() }),
      "Copied selection context",
      statusBarFeedback,
    ),
    vscode.commands.registerCommand("quickCopy.quickCopyActiveReference", async () => {
      const editor = vscode.window.activeTextEditor;

      if (editor && editor.selections.length > 1) {
        await showError("Multiple selections are not yet supported");
        return;
      }

      const active = getActiveReferenceContext(editor, { pathStyle: getSettings().pathStyle });
      if (!active) {
        await showError("No active file reference");
        return;
      }

      const settings = getSettings();
      const referenceOptions = getReferenceOutputOptions();

      const text = formatQuickCopyActiveReference(active, settings.quickCopyActiveMode, settings.maxCodeLines, referenceOptions);
      await writeToClipboard(text, "Copied active reference", statusBarFeedback);
    }),
    registerDiagnosticCommand("quickCopy.copyDiagnostic", copyDiagnosticContext, "Copied diagnostic context", statusBarFeedback),
    registerDiagnosticCommand(
      "quickCopy.copyDiagnosticWithCode",
      (uri, target) => copyDiagnosticContextWithCode(uri, target, { maxCodeLines: getSettings().maxCodeLines }),
      "Copied diagnostic context with code",
      statusBarFeedback,
    ),
    vscode.commands.registerCommand("quickCopy.copyErrorContext", async (uri?: vscode.Uri, target?: vscode.Range | vscode.Position) => {
      await vscode.commands.executeCommand("quickCopy.copyDiagnostic", uri, target);
    }),
    vscode.commands.registerCommand("quickCopy.copyErrorContextWithCode", async (uri?: vscode.Uri, target?: vscode.Range | vscode.Position) => {
      await vscode.commands.executeCommand("quickCopy.copyDiagnosticWithCode", uri, target);
    }),

    vscode.languages.registerCodeActionsProvider({ scheme: "file" }, new QuickCopyCodeActionProvider(), {
      providedCodeActionKinds: [QuickCopyCodeActionProvider.kind],
    }),
    vscode.languages.registerCodeLensProvider({ scheme: "file" }, codeLensProvider),
    codeLensProvider,
    scheduleUiRefresh,

    vscode.window.onDidChangeActiveTextEditor(() => {
      scheduleUiRefresh();
    }),
    vscode.window.onDidChangeTextEditorSelection(() => {
      scheduleUiRefresh();
    }),
    vscode.languages.onDidChangeDiagnostics((event) => {
      if (event.uris.length === 0) {
        clearDiagnosticCodeLensCache();
      } else {
        for (const uri of event.uris) {
          clearDiagnosticCodeLensCache(uri);
        }
      }

      scheduleUiRefresh();
    }),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!shouldRefreshConfiguration(event)) {
        return;
      }

      clearDiagnosticCodeLensCache();
      scheduleUiRefresh();
    }),
  );

  scheduleUiRefresh();
}

export function deactivate(): void {}

async function updateContextKeys(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  const canCopySelection = isSingleNonEmptySelection(editor);
  const canCopyDiagnostic = hasDiagnosticAtCursor(editor);

  if (lastContextState?.canCopySelection !== canCopySelection) {
    await vscode.commands.executeCommand("setContext", EXTENSION_CONTEXT_KEYS.canCopySelectionContext, canCopySelection);
  }

  if (lastContextState?.canCopyDiagnostic !== canCopyDiagnostic) {
    await vscode.commands.executeCommand("setContext", EXTENSION_CONTEXT_KEYS.canCopyDiagnosticContext, canCopyDiagnostic);
  }

  lastContextState = {
    canCopySelection,
    canCopyDiagnostic,
  };
}

function requireSelectionContext() {
  const editor = vscode.window.activeTextEditor;

  if (editor && editor.selections.length > 1) {
    void showError("Multiple selections are not yet supported");
    return undefined;
  }

  const selection = getSelectionContext(editor, { pathStyle: getSettings().pathStyle });
  if (!selection) {
    void showError("No active selection");
    return undefined;
  }

  return selection;
}

function registerSelectionCommand(
  command: string,
  formatter: (selection: SelectionContext) => string,
  statusMessage: string,
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable {
  return vscode.commands.registerCommand(command, async () => {
    const selection = requireSelectionContext();
    if (!selection) {
      return;
    }

    await writeToClipboard(formatter(selection), statusMessage, statusBarFeedback);
  });
}

function registerFileCommand(
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

function registerDiagnosticCommand(
  command: string,
  formatter: (uri?: vscode.Uri, target?: vscode.Range | vscode.Position) => Promise<string | undefined>,
  statusMessage: string,
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable {
  return vscode.commands.registerCommand(command, async (uri?: vscode.Uri, target?: vscode.Range | vscode.Position) => {
    const text = await formatter(uri, target);
    if (!text) {
      await showError("No diagnostic found at current position");
      return;
    }

    await writeToClipboard(text, statusMessage, statusBarFeedback);
  });
}

async function writeToClipboard(text: string, statusMessage: string, statusBarFeedback: vscode.StatusBarItem): Promise<void> {
  try {
    await vscode.env.clipboard.writeText(text);
    showCopyFeedback(statusBarFeedback, statusMessage);
  } catch {
    await showError("Unable to copy to clipboard");
  }
}

async function showError(message: string): Promise<void> {
  await vscode.window.showErrorMessage(message);
}

function getReferenceTemplateOptions() {
  const settings = getSettings();

  return {
    singleLineReferenceTemplate: settings.singleLineReferenceTemplate,
    lineRangeReferenceTemplate: settings.lineRangeReferenceTemplate,
    charRangeReferenceTemplate: settings.charRangeReferenceTemplate,
  };
}

function getReferenceOutputOptions() {
  const settings = getSettings();

  return {
    ...getReferenceTemplateOptions(),
    surroundWithSpaces: settings.padCopiedPathsWithSpaces,
    surroundWithBlankLines: settings.padCopiedContextWithBlankLines,
  };
}

function getPathOutputOptions(pathStyle: ReturnType<typeof getSettings>["pathStyle"]) {
  const settings = getSettings();

  return {
    pathStyle,
    surroundWithSpaces: settings.padCopiedPathsWithSpaces,
  };
}

function formatQuickCopyActiveReference(
  selection: SelectionContext,
  mode: ReturnType<typeof getSettings>["quickCopyActiveMode"],
  maxCodeLines: number,
  referenceOptions: ReturnType<typeof getReferenceOutputOptions>,
): string {
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

const UI_REFRESH_DEBOUNCE_MS = 80;
let lastContextState:
  | {
      canCopySelection: boolean;
      canCopyDiagnostic: boolean;
    }
  | undefined;

function createDebouncedUiRefresh(codeLensProvider: QuickCopyCodeLensProvider): vscode.Disposable & (() => void) {
  let timer: NodeJS.Timeout | undefined;

  const run = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      codeLensProvider.refresh();
      void updateContextKeys();
      timer = undefined;
    }, UI_REFRESH_DEBOUNCE_MS);
  };

  return Object.assign(run, {
    dispose() {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    },
  });
}

function createStatusBarFeedback(): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  item.name = "Copia Feedback";
  return item;
}

let statusBarHideTimer: NodeJS.Timeout | undefined;

function showCopyFeedback(statusBarFeedback: vscode.StatusBarItem, message: string): void {
  statusBarFeedback.text = `$(check) ${message}`;
  statusBarFeedback.tooltip = message;
  statusBarFeedback.show();

  if (statusBarHideTimer) {
    clearTimeout(statusBarHideTimer);
  }

  statusBarHideTimer = setTimeout(() => {
    statusBarFeedback.hide();
    statusBarHideTimer = undefined;
  }, 1800);
}
