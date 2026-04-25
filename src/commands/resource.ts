import * as path from "node:path";
import * as vscode from "vscode";

import { formatPath } from "../formatters";
import { getPathOutputOptions } from "../settings";
import { registerFileCommand } from "./register";

export function registerResourceCommands(
  statusBarFeedback: vscode.StatusBarItem,
): vscode.Disposable[] {
  return [
    registerFileCommand(
      "quickCopy.copyFileName",
      (uri) => path.basename(uri.fsPath),
      "Copied file name",
      statusBarFeedback,
    ),
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
  ];
}
