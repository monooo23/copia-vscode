import * as vscode from "vscode";

import { getDiagnosticCodeLensMessage, getDiagnosticsByStartLine, getDiagnosticSeverityIcon } from "./diagnostics";
import { isSingleNonEmptySelection } from "./formatters";
import { getSettings } from "./settings";

export class QuickCopyCodeLensProvider implements vscode.CodeLensProvider {
  private readonly changeEmitter = new vscode.EventEmitter<void>();

  public readonly onDidChangeCodeLenses = this.changeEmitter.event;

  public refresh(): void {
    this.changeEmitter.fire();
  }

  public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.toString() !== document.uri.toString()) {
      return [];
    }

    const settings = getSettings();

    return [
      ...this.buildSelectionCodeLenses(editor, settings.enableSelectionCodeLens),
      ...this.buildDiagnosticCodeLenses(
        document,
        settings.enableDiagnosticCodeLens,
        settings.showDiagnosticCodeLensMessage,
      ),
    ];
  }

  public dispose(): void {
    this.changeEmitter.dispose();
  }

  private buildSelectionCodeLenses(editor: vscode.TextEditor, enabled: boolean): vscode.CodeLens[] {
    if (!enabled || !isSingleNonEmptySelection(editor)) {
      return [];
    }

    const line = editor.selection.start.line;
    const range = new vscode.Range(line, 0, line, 0);

    return [
      new vscode.CodeLens(range, {
        title: "$(copy) Selection",
        command: "quickCopy.copySelection",
      }),
      new vscode.CodeLens(range, {
        title: "$(file) Name",
        command: "quickCopy.copyFileName",
      }),
      new vscode.CodeLens(range, {
        title: "$(list-ordered) Lines",
        command: "quickCopy.copyPathWithLines",
      }),
      new vscode.CodeLens(range, {
        title: "$(symbol-string) Chars",
        command: "quickCopy.copyPathWithLinesAndChars",
      }),
      new vscode.CodeLens(range, {
        title: "$(clippy) Context",
        command: "quickCopy.copyContext",
      }),
    ];
  }

  private buildDiagnosticCodeLenses(
    document: vscode.TextDocument,
    enabled: boolean,
    showMessage: boolean,
  ): vscode.CodeLens[] {
    if (!enabled) {
      return [];
    }

    const diagnosticsByLine = getDiagnosticsByStartLine(document.uri);
    if (diagnosticsByLine.size === 0) {
      return [];
    }

    const lenses: vscode.CodeLens[] = [];
    for (const [line, lineDiagnostics] of diagnosticsByLine.entries()) {
      const range = new vscode.Range(line, 0, line, 0);
      const lineRange = document.lineAt(line).range;
      const icon = getDiagnosticSeverityIcon(lineDiagnostics);

      lenses.push(
        new vscode.CodeLens(range, {
          title: `${icon} Copy Diagnostic`,
          command: "quickCopy.copyDiagnostic",
          arguments: [document.uri, lineRange],
        }),
      );

      const message = showMessage ? getDiagnosticCodeLensMessage(lineDiagnostics) : undefined;
      if (message) {
        lenses.push(
          new vscode.CodeLens(range, {
            title: message,
            command: "quickCopy.copyDiagnostic",
            arguments: [document.uri, lineRange],
          }),
        );
      }
    }

    return lenses;
  }
}
