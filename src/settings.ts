import * as vscode from "vscode";

export type PathStyle = "workspaceRelative" | "absolute";
export type DiagnosticCodeLensSeverity = "error" | "errorAndWarning" | "all";
export type QuickCopyActiveMode = "singleLine" | "lineRange" | "charRange" | "context";
export type SelectionActionsUi = "statusBar" | "codeLens" | "off";

export interface CopiaSettings {
  readonly maxCodeLines: number;
  readonly pathStyle: PathStyle;
  readonly padCopiedPathsWithSpaces: boolean;
  readonly padCopiedContextWithBlankLines: boolean;
  readonly selectionActionsUi: SelectionActionsUi;
  readonly enableDiagnosticCodeLens: boolean;
  readonly showDiagnosticCodeLensMessage: boolean;
  readonly diagnosticCodeLensSeverity: DiagnosticCodeLensSeverity;
  readonly singleLineReferenceTemplate: string;
  readonly lineRangeReferenceTemplate: string;
  readonly charRangeReferenceTemplate: string;
  readonly quickCopyActiveMode: QuickCopyActiveMode;
}

export function getSettings(): CopiaSettings {
  const configuration = vscode.workspace.getConfiguration("copia");

  return {
    maxCodeLines: configuration.get<number>("maxCodeLines", 5),
    pathStyle: configuration.get<PathStyle>("pathStyle", "workspaceRelative"),
    padCopiedPathsWithSpaces: configuration.get<boolean>("padCopiedPathsWithSpaces", true),
    padCopiedContextWithBlankLines: configuration.get<boolean>("padCopiedContextWithBlankLines", true),
    selectionActionsUi: configuration.get<SelectionActionsUi>("selectionActionsUi", "statusBar"),
    enableDiagnosticCodeLens: configuration.get<boolean>("enableDiagnosticCodeLens", true),
    showDiagnosticCodeLensMessage: configuration.get<boolean>("showDiagnosticCodeLensMessage", true),
    diagnosticCodeLensSeverity: configuration.get<DiagnosticCodeLensSeverity>(
      "diagnosticCodeLensSeverity",
      "errorAndWarning",
    ),
    singleLineReferenceTemplate: configuration.get<string>(
      "singleLineReferenceTemplate",
      "file: ${pathRef}#L${startLine}",
    ),
    lineRangeReferenceTemplate: configuration.get<string>(
      "lineRangeReferenceTemplate",
      "file: ${pathRef}#L${startLine}-L${endLine}",
    ),
    charRangeReferenceTemplate: configuration.get<string>(
      "charRangeReferenceTemplate",
      "file: ${pathRef}#L${startLine}:${startColumn}-L${endLine}:${endColumn}",
    ),
    quickCopyActiveMode: configuration.get<QuickCopyActiveMode>("quickCopyActiveMode", "lineRange"),
  };
}

export function shouldRefreshConfiguration(event: vscode.ConfigurationChangeEvent): boolean {
  return event.affectsConfiguration("copia");
}
