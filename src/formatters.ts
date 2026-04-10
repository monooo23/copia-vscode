import * as path from "node:path";
import * as vscode from "vscode";

import { buildWorkspaceRelativePath, normalizePath } from "./pathing";
import {
  buildCodeFence,
  buildLineReference,
  buildLocationReference,
  CodeBlockOptions,
  ReferenceTemplateOptions,
  renderDiagnosticMessage,
  surroundWithBlankLines,
  surroundWithSpaces,
} from "./rendering";
import type { PathStyle } from "./settings";

export interface LocationContext {
  readonly pathText: string;
  readonly pathRef: string;
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
}

export interface SelectionContext extends LocationContext {
  readonly selectedText: string;
  readonly languageId: string;
}

export interface DiagnosticContext extends LocationContext {
  readonly message: string;
}

export interface DiagnosticCodeContext extends DiagnosticContext {
  readonly codeText: string;
  readonly languageId: string;
}

export interface PathOptions {
  readonly pathStyle?: PathStyle;
}

export interface ReferenceOptions extends ReferenceTemplateOptions {
  readonly pathStyle?: PathStyle;
}

export interface OutputFormattingOptions extends ReferenceTemplateOptions {
  readonly surroundWithSpaces?: boolean;
  readonly surroundWithBlankLines?: boolean;
}

export function isSingleNonEmptySelection(editor: vscode.TextEditor | undefined): editor is vscode.TextEditor {
  return Boolean(
    editor &&
      editor.document.uri.scheme === "file" &&
      editor.selections.length === 1 &&
      !editor.selection.isEmpty,
  );
}

export function getSelectionContext(editor: vscode.TextEditor | undefined, options?: PathOptions): SelectionContext | undefined {
  if (!isSingleNonEmptySelection(editor)) {
    return undefined;
  }

  const { document, selection } = editor;

  return {
    pathText: getDisplayPath(document.uri, options),
    pathRef: getPathReference(document.uri, options),
    startLine: selection.start.line + 1,
    startChar: selection.start.character + 1,
    endLine: selection.end.line + 1,
    endChar: selection.end.character + 1,
    selectedText: document.getText(selection),
    languageId: document.languageId,
  };
}

export function getActiveReferenceContext(editor: vscode.TextEditor | undefined, options?: PathOptions): SelectionContext | undefined {
  if (!editor || editor.document.uri.scheme !== "file" || editor.selections.length !== 1) {
    return undefined;
  }

  const selectionContext = getSelectionContext(editor, options);
  if (selectionContext) {
    return selectionContext;
  }

  const line = editor.document.lineAt(editor.selection.active.line);
  const range = line.range;

  return {
    pathText: getDisplayPath(editor.document.uri, options),
    pathRef: getPathReference(editor.document.uri, options),
    startLine: range.start.line + 1,
    startChar: range.start.character + 1,
    endLine: range.end.line + 1,
    endChar: range.end.character + 1,
    selectedText: line.text,
    languageId: editor.document.languageId,
  };
}

export function formatPath(
  uri: vscode.Uri,
  options?: PathOptions & Pick<OutputFormattingOptions, "surroundWithSpaces">,
): string {
  return surroundWithSpaces(getDisplayPath(uri, options), options?.surroundWithSpaces);
}

export function formatPathWithSingleLine(context: SelectionContext, options?: OutputFormattingOptions): string {
  return surroundWithSpaces(
    buildLineReference(
      {
        path: context.pathText,
        pathRef: context.pathRef,
        startLine: context.startLine,
        endLine: context.startLine,
      },
      options,
    ),
    options?.surroundWithSpaces,
  );
}

export function formatPathWithLines(context: SelectionContext, options?: OutputFormattingOptions): string {
  return surroundWithSpaces(buildLineReference(toReferenceContext(context), options), options?.surroundWithSpaces);
}

export function formatPathWithLinesAndChars(context: SelectionContext, options?: OutputFormattingOptions): string {
  return surroundWithSpaces(buildLocationReference(toReferenceContext(context), options), options?.surroundWithSpaces);
}

export function formatCopyContext(
  context: SelectionContext,
  options?: CodeBlockOptions & OutputFormattingOptions,
): string {
  const location = buildLocationReference(toReferenceContext(context), options);
  const fence = buildCodeFence(context.selectedText, context.languageId, options);

  return surroundWithBlankLines(`${location}\n${fence}`, options?.surroundWithBlankLines);
}

export function formatDiagnosticContext(context: DiagnosticContext, options?: ReferenceTemplateOptions): string {
  return `${buildLocationReference(toReferenceContext(context), options)}\n${context.message}`;
}

export function formatDiagnosticContextWithCode(
  context: DiagnosticCodeContext,
  options?: CodeBlockOptions & OutputFormattingOptions,
): string {
  const location = buildLocationReference(toReferenceContext(context), options);
  const fence = buildCodeFence(context.codeText, context.languageId, options);

  return surroundWithBlankLines(`${location}\n${context.message}\n${fence}`, options?.surroundWithBlankLines);
}

export function buildDiagnosticMessage(diagnostic: vscode.Diagnostic): string {
  return renderDiagnosticMessage({
    severity: formatDiagnosticSeverity(diagnostic.severity),
    source: diagnostic.source,
    code: normalizeDiagnosticCode(diagnostic.code),
    message: diagnostic.message,
  });
}

export function getDisplayPath(uri: vscode.Uri, options?: PathOptions): string {
  if (options?.pathStyle === "absolute") {
    return normalizePath(uri.fsPath);
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

  if (workspaceFolder) {
    const relative = normalizePath(path.relative(workspaceFolder.uri.fsPath, uri.fsPath));
    return buildWorkspaceRelativePath(
      relative,
      path.basename(uri.fsPath),
      workspaceFolder.name,
      (vscode.workspace.workspaceFolders?.length ?? 0) > 1,
    );
  }

  return normalizePath(uri.fsPath);
}

export function getPathReference(uri: vscode.Uri, options?: PathOptions): string {
  if (options?.pathStyle === "absolute") {
    return normalizePath(uri.fsPath);
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

  if (workspaceFolder) {
    const relativePath = buildWorkspaceRelativePath(
      normalizePath(path.relative(workspaceFolder.uri.fsPath, uri.fsPath)),
      path.basename(uri.fsPath),
      workspaceFolder.name,
      (vscode.workspace.workspaceFolders?.length ?? 0) > 1,
    );
    return `@/${relativePath}`;
  }

  return normalizePath(uri.fsPath);
}

function toReferenceContext(context: LocationContext) {
  return {
    ...context,
    path: context.pathText,
    startColumn: context.startChar,
    endColumn: context.endChar,
  };
}

function normalizeDiagnosticCode(code: vscode.Diagnostic["code"]): string | undefined {
  if (typeof code === "string" || typeof code === "number") {
    return String(code);
  }

  if (code && typeof code === "object" && "value" in code) {
    const value = code.value;
    return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
  }

  return undefined;
}

function formatDiagnosticSeverity(severity: vscode.DiagnosticSeverity): string {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error:
      return "error";
    case vscode.DiagnosticSeverity.Warning:
      return "warning";
    case vscode.DiagnosticSeverity.Information:
      return "info";
    case vscode.DiagnosticSeverity.Hint:
      return "hint";
    default:
      return "diagnostic";
  }
}

export { buildCodeFence, buildLocationReference, CodeBlockOptions };
