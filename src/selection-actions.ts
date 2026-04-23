import * as vscode from "vscode";

import { isSingleNonEmptySelection } from "./formatters";
import { getSettings } from "./settings";

type SelectionActionCommand =
  | "quickCopy.copySelection"
  | "quickCopy.copyFileName"
  | "quickCopy.copyPathWithLines"
  | "quickCopy.copyPathWithLinesAndChars"
  | "quickCopy.copyContext";

interface SelectionActionItem extends vscode.QuickPickItem {
  readonly command: SelectionActionCommand;
}

const SELECTION_ACTION_ITEMS: SelectionActionItem[] = [
  {
    label: "$(copy) Copy Selection",
    description: "Selected text only",
    command: "quickCopy.copySelection",
  },
  {
    label: "$(file) Copy File Name",
    description: "File name only",
    command: "quickCopy.copyFileName",
  },
  {
    label: "$(list-ordered) Copy Path + Lines",
    description: "Reference with line range",
    command: "quickCopy.copyPathWithLines",
  },
  {
    label: "$(symbol-string) Copy Path + Lines + Chars",
    description: "Reference with exact character range",
    command: "quickCopy.copyPathWithLinesAndChars",
  },
  {
    label: "$(clippy) Copy Context",
    description: "Reference plus code block",
    command: "quickCopy.copyContext",
  },
];

export class SelectionActionsStatusBar implements vscode.Disposable {
  private readonly item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1010);

  constructor() {
    this.item.name = "Copia Selection Actions";
    this.item.command = "quickCopy.showSelectionActions";
    this.item.text = "$(copy) Copia";
    this.item.tooltip = "Open Copia selection actions";
  }

  public refresh(): void {
    const editor = vscode.window.activeTextEditor;

    if (getSettings().selectionActionsUi !== "statusBar" || !isSingleNonEmptySelection(editor)) {
      this.item.hide();
      return;
    }

    this.item.show();
  }

  public dispose(): void {
    this.item.dispose();
  }
}

export async function showSelectionActionsQuickPick(): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!isSingleNonEmptySelection(editor)) {
    await vscode.window.showErrorMessage("No active selection");
    return;
  }

  const pick = await vscode.window.showQuickPick(SELECTION_ACTION_ITEMS, {
    title: "Copia",
    placeHolder: "Choose a selection copy action",
  });

  if (!pick) {
    return;
  }

  await vscode.commands.executeCommand(pick.command);
}
