import * as vscode from "vscode";

import { isSingleNonEmptySelection } from "./formatters";
import { getSettings } from "./settings";

type SelectionActionCommand =
  | "quickCopy.copySelection"
  | "quickCopy.copyFileName"
  | "quickCopy.copyPathWithLines"
  | "quickCopy.copyPathWithLinesAndChars"
  | "quickCopy.copyContext"
  | "quickCopy.copyEnclosingSymbol"
  | "quickCopy.stageAdd";

interface SelectionAction extends vscode.QuickPickItem {
  readonly label: string;
  readonly description: string;
  readonly command: SelectionActionCommand;
}

const SELECTION_ACTIONS: SelectionAction[] = [
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
  {
    label: "$(symbol-method) Copy Enclosing Symbol",
    description: "Enclosing function or class as context",
    command: "quickCopy.copyEnclosingSymbol",
  },
  {
    label: "$(layers) Add to Stage",
    description: "Append selection to the Copia stage",
    command: "quickCopy.stageAdd",
  },
];

function buildActionsHoverMarkdown(): vscode.MarkdownString {
  const md = new vscode.MarkdownString();
  md.isTrusted = { enabledCommands: SELECTION_ACTIONS.map((action) => action.command) };
  md.supportThemeIcons = true;

  const links = SELECTION_ACTIONS
    .map((action) => `[${action.label}](command:${action.command} "${action.description}")`)
    .join("  \n");
  md.appendMarkdown(`**Copia**  \n${links}`);

  return md;
}

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

export class SelectionActionsHoverProvider implements vscode.HoverProvider {
  public provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | undefined {
    if (getSettings().selectionActionsUi !== "hover") {
      return undefined;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.uri.toString() !== document.uri.toString()) {
      return undefined;
    }

    if (!isSingleNonEmptySelection(editor) || !editor.selection.contains(position)) {
      return undefined;
    }

    return new vscode.Hover(buildActionsHoverMarkdown(), new vscode.Range(position, position));
  }
}

export async function showSelectionActionsQuickPick(): Promise<void> {
  const editor = vscode.window.activeTextEditor;

  if (!isSingleNonEmptySelection(editor)) {
    await vscode.window.showErrorMessage("No active selection");
    return;
  }

  const pick = await vscode.window.showQuickPick(SELECTION_ACTIONS, {
    title: "Copia",
    placeHolder: "Choose a selection copy action",
  });

  if (!pick) {
    return;
  }

  await vscode.commands.executeCommand(pick.command);
}
