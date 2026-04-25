import * as vscode from "vscode";

import {
  buildDiagnosticMessage,
  DiagnosticCodeContext,
  DiagnosticContext,
  formatDiagnosticContext,
  formatDiagnosticContextWithCode,
  getDisplayPath,
  getPathReference,
} from "./formatters";
import {
  DiagnosticCodeLensSeverity,
  getReferenceTemplateOptions,
  getSettings,
  padContextOutput,
} from "./settings";

export interface DiagnosticFormatOptions {
  readonly maxCodeLines?: number;
}

interface ResolvedDiagnosticContext {
  readonly document: vscode.TextDocument;
  readonly diagnostic: vscode.Diagnostic;
  readonly context: DiagnosticContext;
}

interface DiagnosticsByLineCacheEntry {
  readonly severity: DiagnosticCodeLensSeverity;
  readonly lineMap: Map<number, vscode.Diagnostic[]>;
}

const diagnosticsByLineCache = new Map<string, DiagnosticsByLineCacheEntry>();

export interface DiagnosticCopyResult {
  readonly text: string;
  readonly count: number;
}

export async function copyDiagnosticContext(
  uri?: vscode.Uri,
  rangeOrPosition?: vscode.Range | vscode.Position,
): Promise<DiagnosticCopyResult | undefined> {
  const resolved = await resolveDiagnosticContexts(uri, rangeOrPosition);
  if (!resolved) {
    return undefined;
  }

  const blocks = resolved.map((entry) =>
    formatDiagnosticContext(entry.context, getReferenceTemplateOptions()),
  );
  return { text: blocks.join("\n\n"), count: blocks.length };
}

export async function copyDiagnosticContextWithCode(
  uri?: vscode.Uri,
  rangeOrPosition?: vscode.Range | vscode.Position,
  options?: DiagnosticFormatOptions,
): Promise<DiagnosticCopyResult | undefined> {
  const resolved = await resolveDiagnosticContexts(uri, rangeOrPosition);
  if (!resolved) {
    return undefined;
  }

  const blocks = resolved.map((entry) => {
    const codeContext: DiagnosticCodeContext = {
      ...entry.context,
      codeText: getDiagnosticCodeText(entry.document, entry.diagnostic.range),
      languageId: entry.document.languageId,
    };

    return formatDiagnosticContextWithCode(codeContext, {
      maxLines: options?.maxCodeLines,
      ...getReferenceTemplateOptions(),
      surroundWithBlankLines: false,
    });
  });

  return { text: padContextOutput(blocks.join("\n\n")), count: blocks.length };
}

export function hasDiagnosticAtCursor(editor: vscode.TextEditor | undefined): boolean {
  if (!editor || editor.document.uri.scheme !== "file") {
    return false;
  }

  return getDiagnosticsAtTarget(editor.document.uri, editor.selection.active).length > 0;
}

export function getDiagnosticsByStartLine(uri: vscode.Uri): Map<number, vscode.Diagnostic[]> {
  const severity = getSettings().diagnosticCodeLensSeverity;
  const cacheKey = uri.toString();
  const cached = diagnosticsByLineCache.get(cacheKey);
  if (cached && cached.severity === severity) {
    return cached.lineMap;
  }

  const lineMap = new Map<number, vscode.Diagnostic[]>();

  for (const diagnostic of filterDiagnosticsForCodeLens(getSortedDiagnostics(uri), severity)) {
    const line = diagnostic.range.start.line;
    const diagnostics = lineMap.get(line);
    if (diagnostics) {
      diagnostics.push(diagnostic);
    } else {
      lineMap.set(line, [diagnostic]);
    }
  }

  diagnosticsByLineCache.set(cacheKey, { severity, lineMap });
  return lineMap;
}

export function clearDiagnosticCodeLensCache(uri?: vscode.Uri): void {
  if (uri) {
    diagnosticsByLineCache.delete(uri.toString());
    return;
  }

  diagnosticsByLineCache.clear();
}

export function getDiagnosticSeverityIcon(diagnostics: readonly vscode.Diagnostic[]): string {
  const best = diagnostics.reduce((current, diagnostic) => {
    if (!current || diagnostic.severity < current.severity) {
      return diagnostic;
    }

    return current;
  }, undefined as vscode.Diagnostic | undefined);

  switch (best?.severity) {
    case vscode.DiagnosticSeverity.Error:
      return "$(error)";
    case vscode.DiagnosticSeverity.Warning:
      return "$(warning)";
    case vscode.DiagnosticSeverity.Information:
      return "$(info)";
    case vscode.DiagnosticSeverity.Hint:
      return "$(light-bulb)";
    default:
      return "$(note)";
  }
}

export function getDiagnosticCodeLensMessage(diagnostics: readonly vscode.Diagnostic[]): string | undefined {
  const primary = diagnostics[0];
  if (!primary) {
    return undefined;
  }

  const message = buildDiagnosticMessage(primary).replace(/\s+/g, " ").trim();
  return truncateDiagnosticCodeLensMessage(message, 96);
}

export class QuickCopyCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly kind = vscode.CodeActionKind.QuickFix.append("quickCopy");

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    if (document.uri.scheme !== "file" || context.diagnostics.length === 0) {
      return [];
    }

    return [
      this.createAction("Copia: Copy Diagnostic", "quickCopy.copyDiagnostic", document.uri, range, true),
      this.createAction("Copia: Copy Diagnostic + Code", "quickCopy.copyDiagnosticWithCode", document.uri, range),
    ];
  }

  private createAction(
    title: string,
    command: string,
    uri: vscode.Uri,
    range: vscode.Range,
    isPreferred = false,
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(title, QuickCopyCodeActionProvider.kind);
    action.command = {
      command,
      title,
      arguments: [uri, range],
    };
    action.isPreferred = isPreferred;

    return action;
  }
}

async function resolveDiagnosticContexts(
  uri?: vscode.Uri,
  rangeOrPosition?: vscode.Range | vscode.Position,
): Promise<ResolvedDiagnosticContext[] | undefined> {
  const targetUri = uri ?? vscode.window.activeTextEditor?.document.uri;
  if (!targetUri || targetUri.scheme !== "file") {
    return undefined;
  }

  const target = rangeOrPosition ?? vscode.window.activeTextEditor?.selection.active;
  const diagnostics = getDiagnosticsAtTarget(targetUri, target);
  if (diagnostics.length === 0) {
    return undefined;
  }

  const selected = diagnostics.length === 1 ? diagnostics : await pickDiagnostics(diagnostics);
  if (!selected || selected.length === 0) {
    return undefined;
  }

  const document = await vscode.workspace.openTextDocument(targetUri);
  const settings = getSettings();
  const pathText = getDisplayPath(targetUri, { pathStyle: settings.pathStyle });
  const pathRef = getPathReference(targetUri, { pathStyle: settings.pathStyle });

  return selected.map((diagnostic) => ({
    document,
    diagnostic,
    context: {
      pathText,
      pathRef,
      startLine: diagnostic.range.start.line + 1,
      startChar: diagnostic.range.start.character + 1,
      endLine: diagnostic.range.end.line + 1,
      endChar: diagnostic.range.end.character + 1,
      message: buildDiagnosticMessage(diagnostic),
    },
  }));
}

function getDiagnosticsAtTarget(
  uri: vscode.Uri,
  target?: vscode.Range | vscode.Position,
): vscode.Diagnostic[] {
  const diagnostics = getSortedDiagnostics(uri);

  if (!target) {
    return diagnostics;
  }

  if (target instanceof vscode.Position) {
    return diagnostics.filter((diagnostic) => diagnostic.range.contains(target));
  }

  return diagnostics.filter((diagnostic) => diagnostic.range.intersection(target) !== undefined);
}

function getSortedDiagnostics(uri: vscode.Uri): vscode.Diagnostic[] {
  return [...vscode.languages.getDiagnostics(uri)].sort((left, right) => {
    const severityOrder = left.severity - right.severity;
    if (severityOrder !== 0) {
      return severityOrder;
    }

    const lineOrder = left.range.start.line - right.range.start.line;
    if (lineOrder !== 0) {
      return lineOrder;
    }

    return left.range.start.character - right.range.start.character;
  });
}

function filterDiagnosticsForCodeLens(
  diagnostics: readonly vscode.Diagnostic[],
  severity: DiagnosticCodeLensSeverity,
): vscode.Diagnostic[] {
  switch (severity) {
    case "error":
      return diagnostics.filter((diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Error);
    case "errorAndWarning":
      return diagnostics.filter(
        (diagnostic) =>
          diagnostic.severity === vscode.DiagnosticSeverity.Error ||
          diagnostic.severity === vscode.DiagnosticSeverity.Warning,
      );
    case "all":
    default:
      return [...diagnostics];
  }
}

interface DiagnosticPickItem extends vscode.QuickPickItem {
  readonly diagnostic?: vscode.Diagnostic;
  readonly all?: true;
}

async function pickDiagnostics(
  diagnostics: readonly vscode.Diagnostic[],
): Promise<vscode.Diagnostic[] | undefined> {
  const items: DiagnosticPickItem[] = [
    {
      label: `$(checklist) Copy all ${diagnostics.length} diagnostics`,
      description: "Bundle every diagnostic at this location",
      all: true,
    },
    { label: "", kind: vscode.QuickPickItemKind.Separator },
    ...diagnostics.map<DiagnosticPickItem>((diagnostic) => ({
      label: buildDiagnosticMessage(diagnostic),
      description: `Line ${diagnostic.range.start.line + 1}`,
      diagnostic,
    })),
  ];

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a diagnostic to copy, or copy all",
  });

  if (!picked) {
    return undefined;
  }

  if (picked.all) {
    return [...diagnostics];
  }

  return picked.diagnostic ? [picked.diagnostic] : undefined;
}

function getDiagnosticCodeText(document: vscode.TextDocument, range: vscode.Range): string {
  if (!range.isEmpty) {
    return document.getText(range);
  }

  return document.lineAt(range.start.line).text;
}

function truncateDiagnosticCodeLensMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) {
    return message;
  }

  return `${message.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

