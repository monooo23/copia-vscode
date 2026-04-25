import * as vscode from "vscode";

const STATUS_HIDE_MS = 1800;

let statusBarHideTimer: NodeJS.Timeout | undefined;

export function createStatusBarFeedback(): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
  item.name = "Copia Feedback";
  return item;
}

export function showCopyFeedback(item: vscode.StatusBarItem, message: string): void {
  item.text = `$(check) ${message}`;
  item.tooltip = message;
  item.show();

  if (statusBarHideTimer) {
    clearTimeout(statusBarHideTimer);
  }

  statusBarHideTimer = setTimeout(() => {
    item.hide();
    statusBarHideTimer = undefined;
  }, STATUS_HIDE_MS);
}

export async function writeToClipboard(
  text: string,
  statusMessage: string,
  statusBarFeedback: vscode.StatusBarItem,
): Promise<void> {
  try {
    await vscode.env.clipboard.writeText(text);
    showCopyFeedback(statusBarFeedback, statusMessage);
  } catch {
    await showError("Unable to copy to clipboard");
  }
}

export async function showError(message: string): Promise<void> {
  await vscode.window.showErrorMessage(message);
}
