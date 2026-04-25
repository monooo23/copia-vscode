import * as vscode from "vscode";

import { getDisplayPath, getPathReference, SelectionContext } from "./formatters";
import { getSettings } from "./settings";
import { findEnclosingSymbol } from "./symbol-tree";

const PREFERRED_SYMBOL_KINDS: ReadonlySet<vscode.SymbolKind> = new Set<vscode.SymbolKind>([
  vscode.SymbolKind.Function,
  vscode.SymbolKind.Method,
  vscode.SymbolKind.Class,
  vscode.SymbolKind.Constructor,
  vscode.SymbolKind.Interface,
  vscode.SymbolKind.Module,
  vscode.SymbolKind.Namespace,
  vscode.SymbolKind.Struct,
  vscode.SymbolKind.Enum,
]);

export interface EnclosingSymbol {
  readonly symbol: vscode.DocumentSymbol;
  readonly context: SelectionContext;
}

export async function getEnclosingSymbol(editor: vscode.TextEditor): Promise<EnclosingSymbol | undefined> {
  if (editor.document.uri.scheme !== "file") {
    return undefined;
  }

  const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
    "vscode.executeDocumentSymbolProvider",
    editor.document.uri,
  );
  if (!symbols || symbols.length === 0) {
    return undefined;
  }

  const matched = findEnclosingSymbol(symbols, editor.selection.active, PREFERRED_SYMBOL_KINDS);
  if (!matched) {
    return undefined;
  }

  const settings = getSettings();
  const range = matched.range;

  return {
    symbol: matched,
    context: {
      pathText: getDisplayPath(editor.document.uri, { pathStyle: settings.pathStyle }),
      pathRef: getPathReference(editor.document.uri, { pathStyle: settings.pathStyle }),
      startLine: range.start.line + 1,
      startChar: range.start.character + 1,
      endLine: range.end.line + 1,
      endChar: range.end.character + 1,
      selectedText: editor.document.getText(range),
      languageId: editor.document.languageId,
    },
  };
}
