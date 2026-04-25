import * as vscode from "vscode";

import { copyDiagnosticContext, copyDiagnosticContextWithCode } from "../diagnostics";
import { getSettings } from "../settings";
import { registerDiagnosticCommand } from "./register";

export function registerDiagnosticCommands(
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable[] {
  return [
    registerDiagnosticCommand(
      "quickCopy.copyDiagnostic",
      copyDiagnosticContext,
      "Copied diagnostic context",
      statusBarFeedback,
    ),
    registerDiagnosticCommand(
      "quickCopy.copyDiagnosticWithCode",
      (uri, target) =>
        copyDiagnosticContextWithCode(uri, target, { maxCodeLines: getSettings().maxCodeLines }),
      "Copied diagnostic context with code",
      statusBarFeedback,
    ),
  ];
}
