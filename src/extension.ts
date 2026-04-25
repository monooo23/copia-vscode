import * as vscode from "vscode";

import { QuickCopyCodeLensProvider } from "./codelens";
import { registerBundleCommand } from "./commands/bundle";
import { registerDiagnosticCommands } from "./commands/diagnostic";
import { registerQuickActiveCommand } from "./commands/quick-active";
import { registerResourceCommands } from "./commands/resource";
import { registerSelectionCommands } from "./commands/selection";
import { registerStageCommands } from "./commands/stage";
import { registerSymbolCommand } from "./commands/symbol";
import { updateContextKeys } from "./context-keys";
import {
  clearDiagnosticCodeLensCache,
  QuickCopyCodeActionProvider,
} from "./diagnostics";
import { createStatusBarFeedback } from "./feedback";
import {
  SelectionActionsHoverProvider,
  SelectionActionsStatusBar,
  showSelectionActionsQuickPick,
} from "./selection-actions";
import { shouldRefreshConfiguration } from "./settings";
import { StageManager } from "./stage";

const UI_REFRESH_DEBOUNCE_MS = 80;

export function activate(context: vscode.ExtensionContext): void {
  const codeLensProvider = new QuickCopyCodeLensProvider();
  const statusBarFeedback = createStatusBarFeedback();
  const selectionActionsStatusBar = new SelectionActionsStatusBar();
  const stage = new StageManager();
  const scheduleUiRefresh = createDebouncedUiRefresh(codeLensProvider, () => {
    selectionActionsStatusBar.refresh();
  });

  context.subscriptions.push(
    statusBarFeedback,
    selectionActionsStatusBar,
    stage,
    vscode.languages.registerHoverProvider({ scheme: "file" }, new SelectionActionsHoverProvider()),
    ...registerResourceCommands(statusBarFeedback),
    ...registerSelectionCommands(statusBarFeedback),
    ...registerDiagnosticCommands(statusBarFeedback),
    registerQuickActiveCommand(statusBarFeedback),
    registerSymbolCommand(statusBarFeedback),
    registerBundleCommand(statusBarFeedback),
    ...registerStageCommands(stage, statusBarFeedback),
    vscode.commands.registerCommand("quickCopy.showSelectionActions", showSelectionActionsQuickPick),
    vscode.languages.registerCodeActionsProvider({ scheme: "file" }, new QuickCopyCodeActionProvider(), {
      providedCodeActionKinds: [QuickCopyCodeActionProvider.kind],
    }),
    vscode.languages.registerCodeLensProvider({ scheme: "file" }, codeLensProvider),
    codeLensProvider,
    scheduleUiRefresh,
    vscode.window.onDidChangeActiveTextEditor(() => scheduleUiRefresh()),
    vscode.window.onDidChangeTextEditorSelection(() => scheduleUiRefresh()),
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

function createDebouncedUiRefresh(
  codeLensProvider: QuickCopyCodeLensProvider,
  onRefresh?: () => void,
): vscode.Disposable & (() => void) {
  let timer: NodeJS.Timeout | undefined;

  const run = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      codeLensProvider.refresh();
      onRefresh?.();
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
