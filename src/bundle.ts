import * as vscode from "vscode";

import { getPathReference } from "./formatters";
import { buildCodeFence } from "./rendering";
import { CopiaSettings, getSettings } from "./settings";

export interface BundleResult {
  readonly text: string;
  readonly fileCount: number;
  readonly skipped: number;
}

export async function buildResourceBundle(uris: readonly vscode.Uri[]): Promise<BundleResult> {
  const settings = getSettings();
  const blocks: string[] = [];
  let skipped = 0;

  for (const uri of uris) {
    const block = await buildFileBlock(uri, settings);
    if (block) {
      blocks.push(block);
    } else {
      skipped++;
    }
  }

  return {
    text: blocks.join("\n\n"),
    fileCount: blocks.length,
    skipped,
  };
}

async function buildFileBlock(uri: vscode.Uri, settings: CopiaSettings): Promise<string | undefined> {
  if (uri.scheme !== "file") {
    return undefined;
  }

  try {
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.type !== vscode.FileType.File) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  let document: vscode.TextDocument;
  try {
    document = await vscode.workspace.openTextDocument(uri);
  } catch {
    return undefined;
  }

  const heading = `file: ${getPathReference(uri, { pathStyle: settings.pathStyle })}`;
  const fence = buildCodeFence(document.getText(), document.languageId, { maxLines: settings.maxCodeLines });

  return `${heading}\n${fence}`;
}
