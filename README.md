# Copia

Chinese README: `README.zh-CN.md`

Copy for AI from VS Code selections, diagnostics, and resources.

## Features

- `Copia: Copy File Name`
- `Copia: Copy Relative Path`
- `Copia: Copy Absolute Path`
- `Copia: Copy Selection`
- `Copia: Copy Path + Lines`
- `Copia: Copy Path + Lines + Chars`
- `Copia: Copy Context`
- `Copia: Quick Copy Active Reference`
- `Copia: Copy Diagnostic`
- `Copia: Copy Diagnostic + Code`

## Trigger Modes

- Selection actions
  By default, select a non-empty single range to reveal a `Copia` status bar entry with selection actions and without shifting editor lines. You can switch this to CodeLens with `copia.selectionActionsUi`.
- Diagnostic CodeLens
  On a line with diagnostics, Copia shows `Copy Diagnostic`.
- Editor context menu
  Right-click inside the editor and use the `Copia` submenu.
- Quick Fix / Code Action
  On a diagnostic location, use the lightbulb menu for diagnostic copy actions.
- Command Palette
  Search for `Copia`.
- Keyboard shortcut
  Press `Option+L` / `Alt+L` to run `Copia: Copy Relative Path`. Press `Option+Command+L` on macOS or `Alt+Shift+L` on Windows and Linux to run `Copia: Copy Path + Lines` when a selection is active. These defaults can be changed in VS Code Keyboard Shortcuts.
- Explorer / SCM context menu
  Right-click files, folders, or selected resources and use `Copia > Copy File Name`, `Copy Relative Path`, or `Copy Absolute Path`.

## Usage

- In the editor, select some code to reveal the `Copia` selection actions entry in the status bar.
- You can also open the editor context menu to use `Copia`.
- In Explorer or SCM, right-click one or more resources and use `Copia > Copy File Name`, `Copy Relative Path`, or `Copy Absolute Path`.
- On a diagnostic location, use the lightbulb / Quick Fix menu or run `Copia: Copy Diagnostic` or `Copia: Copy Diagnostic + Code` from the Command Palette.
- Press `Option+L` / `Alt+L` to quickly copy the current file's relative path.
- Press `Option+Command+L` on macOS or `Alt+Shift+L` on Windows / Linux to copy `Path + Lines` for the current selection.
- Run `Copia: Quick Copy Active Reference` from the Command Palette, or bind your own shortcut, to use `copia.quickCopyActiveMode`.

## Output Formats

`Copy Path + Lines` uses this shape:

```text
file: @/src/example.ts#L3-L5
```

`Copy Path + Lines + Chars` uses this shape:

```text
file: @/src/example.ts#L3:1-L5:12
```

`Copy Context` and `Copy Diagnostic + Code` use this shape:

```text
file: @/src/example.ts#L3:1-L5:12
```

```ts
const value = getValue();
console.log(value);
```

If the copied code is long, the extension only keeps the first 5 lines by default and appends a fold-style hint such as `... 85 more lines`. You can change this with `copia.maxCodeLines`, or set it to `0` to disable truncation.

## Settings

- `copia.maxCodeLines`
  Maximum number of lines kept in `Copy Context` and `Copy Diagnostic + Code`. Default: `5`. Set to `0` to disable truncation.
- `copia.pathStyle`
  Path rendering mode. Use `workspaceRelative` for relative paths and `@/` anchors, or `absolute` for full filesystem paths.
- `copia.padCopiedPathsWithSpaces`
  Add a leading and trailing space around copied path-like outputs. Default: `true`.
- `copia.padCopiedContextWithBlankLines`
  Add a blank line before and after copied context blocks such as `Copy Context` and `Copy Diagnostic + Code`. Default: `true`.
- `copia.selectionActionsUi`
  Control how selection actions are shown. Available values: `statusBar`, `codeLens`, `off`.
- `copia.enableDiagnosticCodeLens`
  Enable or disable diagnostic CodeLens shortcuts.
- `copia.showDiagnosticCodeLensMessage`
  Show or hide the shortened diagnostic message displayed to the right of `Copy Diagnostic`.
- `copia.diagnosticCodeLensSeverity`
  Control whether diagnostic CodeLens appears for `error`, `errorAndWarning`, or `all`.
- `copia.singleLineReferenceTemplate`
  Template for single-line references. Default: `file: ${pathRef}#L${startLine}`.
- `copia.lineRangeReferenceTemplate`
  Template for multi-line references. Default: `file: ${pathRef}#L${startLine}-L${endLine}`.
- `copia.charRangeReferenceTemplate`
  Template for character-range references. Default: `file: ${pathRef}#L${startLine}:${startColumn}-L${endLine}:${endColumn}`.
- `copia.quickCopyActiveMode`
  Controls what `Copia: Quick Copy Active Reference` copies. Available values: `singleLine`, `lineRange`, `charRange`, `context`.

Supported template variables:

- `${path}`
  Display path, for example `services/loopit/lite/templates/package.2d.json`
- `${pathRef}`
  AI-friendly path reference, for example `@/services/loopit/lite/templates/package.2d.json`
- `${startLine}` / `${endLine}`
  1-based line numbers
- `${startColumn}` / `${endColumn}`
  1-based columns
- `${startChar}` / `${endChar}`
  Alias of `${startColumn}` / `${endColumn}`

Template examples:

- Single line

```json
"copia.singleLineReferenceTemplate": "file: ${pathRef}#L${startLine}"
```

- Multi-line

```json
"copia.lineRangeReferenceTemplate": "file: ${pathRef}#L${startLine}-L${endLine}"
```

- Character range

```json
"copia.charRangeReferenceTemplate": "${pathRef}#L${startLine}:${startColumn}-L${endLine}:${endColumn}"
```

Full settings example:

```json
{
  "copia.maxCodeLines": 5,
  "copia.pathStyle": "workspaceRelative",
  "copia.selectionActionsUi": "statusBar",
  "copia.enableDiagnosticCodeLens": true,
  "copia.diagnosticCodeLensSeverity": "errorAndWarning",
  "copia.singleLineReferenceTemplate": "file: ${pathRef}#L${startLine}",
  "copia.lineRangeReferenceTemplate": "file: ${pathRef}#L${startLine}-L${endLine}",
  "copia.charRangeReferenceTemplate": "file: ${pathRef}#L${startLine}:${startColumn}-L${endLine}:${endColumn}",
  "copia.quickCopyActiveMode": "lineRange"
}
```

## Validation Checklist

- Selection
  Select a single range and confirm the `Copia` status bar entry appears without shifting the editor. If `copia.selectionActionsUi` is `codeLens`, confirm the CodeLens actions appear instead.
- Selection copy
  Run `Copy Context` and verify the output starts with `file: @/...#Lx:y-Lx:y`.
- Truncation
  Select more than 5 lines and verify the code block ends with `... N more lines`.
- Relative path shortcut
  Press `Option+L` / `Alt+L` and verify it copies the current file's relative path.
- Path + lines shortcut
  Press `Option+Command+L` on macOS or `Alt+Shift+L` on Windows / Linux with a selection and verify it copies `Path + Lines`.
- Quick copy active reference
  Run `Copia: Quick Copy Active Reference` from the Command Palette, or assign your own shortcut, and verify the output matches `copia.quickCopyActiveMode`.
- Diagnostics
  Put the cursor on a TypeScript or ESLint diagnostic and verify `Copy Diagnostic` works.
- Diagnostic with code
  Trigger `Copy Diagnostic + Code` and verify the code snippet is included.
- Explorer
  Right-click a file and a folder and verify `Copy File Name`, `Copy Relative Path`, and `Copy Absolute Path`.
- Explorer multiselect
  Multi-select resources and verify copied paths are line-separated.
- SCM
  Right-click changed files in SCM and verify `Copy File Name`, `Copy Relative Path`, and `Copy Absolute Path`.

## Known Limits

- Multi-selection copy is not supported yet.
- Rich floating toolbars are not implemented; Copia uses VS Code-native entry points and CodeLens.
- Explorer / SCM multi-select behavior should still be verified in a live Extension Host across more repository shapes.

## Development

```bash
npm install
npm run compile
npm test
```

Then press `F5` in VS Code to launch the extension host.

Available workspace tasks:

- `npm: compile`
- `npm: watch`
- `npm: check`
