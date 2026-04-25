import * as vscode from "vscode";

import { StagedItem, StageStore } from "./stage-store";

export type { StagedItem } from "./stage-store";

export class StageManager implements vscode.Disposable {
  private readonly store = new StageStore();
  private readonly statusBar: vscode.StatusBarItem;
  private readonly emitter = new vscode.EventEmitter<void>();

  public readonly onDidChange = this.emitter.event;

  constructor() {
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1005);
    this.statusBar.name = "Copia Stage";
    this.statusBar.command = "quickCopy.stageManage";
    this.refresh();
  }

  public add(item: Omit<StagedItem, "id">): StagedItem {
    const staged = this.store.add(item);
    this.refresh();
    return staged;
  }

  public remove(id: string): void {
    if (this.store.remove(id)) {
      this.refresh();
    }
  }

  public clear(): void {
    if (this.store.clear()) {
      this.refresh();
    }
  }

  public list(): readonly StagedItem[] {
    return this.store.list();
  }

  public bundle(): string {
    return this.store.bundle();
  }

  public count(): number {
    return this.store.count();
  }

  public dispose(): void {
    this.statusBar.dispose();
    this.emitter.dispose();
  }

  private refresh(): void {
    const count = this.store.count();
    if (count === 0) {
      this.statusBar.hide();
    } else {
      this.statusBar.text = `$(layers) Copia +${count}`;
      this.statusBar.tooltip = `Copia: ${count} staged item(s). Click to manage.`;
      this.statusBar.show();
    }
    this.emitter.fire();
  }
}

interface StageQuickPickItem extends vscode.QuickPickItem {
  readonly action: "copy" | "clear" | "remove" | "noop";
  readonly itemId?: string;
}

export async function showStageQuickPick(stage: StageManager): Promise<void> {
  if (stage.count() === 0) {
    await vscode.window.showInformationMessage("Copia stage is empty");
    return;
  }

  const items: StageQuickPickItem[] = [
    {
      label: "$(clippy) Copy Stage",
      description: `Copy all ${stage.count()} item(s)`,
      action: "copy",
    },
    {
      label: "$(clear-all) Clear Stage",
      action: "clear",
    },
    { label: "Items", kind: vscode.QuickPickItemKind.Separator, action: "noop" },
    ...stage.list().map<StageQuickPickItem>((item, index) => ({
      label: `${index + 1}. ${item.label}`,
      description: item.description,
      detail: item.detail,
      action: "remove",
      itemId: item.id,
    })),
  ];

  const pick = await vscode.window.showQuickPick(items, {
    title: "Copia Stage",
    placeHolder: "Pick an action, or select an item to remove it",
  });

  if (!pick) {
    return;
  }

  switch (pick.action) {
    case "copy":
      await vscode.commands.executeCommand("quickCopy.stageCopy");
      return;
    case "clear":
      stage.clear();
      return;
    case "remove":
      if (pick.itemId) {
        stage.remove(pick.itemId);
      }
      return;
    case "noop":
      return;
  }
}
