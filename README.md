# Copia

Chinese README: `README.zh-CN.md`

Copy for AI from VS Code selections, diagnostics, and resources.

## Features

Path & selection
- `Copia: Copy File Name`
- `Copia: Copy Relative Path`
- `Copia: Copy Absolute Path`
- `Copia: Copy Selection`
- `Copia: Copy Path + Lines`
- `Copia: Copy Path + Lines + Chars`
- `Copia: Copy Context`
- `Copia: Quick Copy Active Reference`

Symbol-aware
- `Copia: Copy Enclosing Symbol` — copies the smallest enclosing function / method / class / interface / module as a `Copy Context` block, falling back to the deepest containing symbol when no preferred kind matches. Works for any language whose extension contributes a `DocumentSymbolProvider` (TypeScript / JavaScript / Markdown ship with VS Code; Python / Go / Rust / C++ / Java / etc. work once their language extension is installed).

Multi-file bundle
- `Copia: Copy Bundle` — bundles one or more files (or the active editor) into a single AI-friendly block sequence, sharing the existing fence and `copia.maxCodeLines` truncation pipeline. Folders and binary resources are silently skipped.

Diagnostics
- `Copia: Copy Diagnostic`
- `Copia: Copy Diagnostic + Code`

Stage (multi-step prompt assembly)
- `Copia: Stage: Add Selection or File`
- `Copia: Stage: Add Enclosing Symbol`
- `Copia: Stage: Add File(s)`
- `Copia: Stage: Copy All`
- `Copia: Stage: Clear`
- `Copia: Stage: Manage`

Stage is an in-memory queue that lets you accumulate selections, files, and symbols across the codebase before copying them as one bundle. While the stage is non-empty, a `$(layers) Copia +N` entry appears in the status bar; clicking it opens the Manage panel where you can review, remove, copy, or clear items.

## Trigger Modes

- Selection actions
  By default, select a non-empty single range to reveal a `Copia` status bar entry with selection actions and without shifting editor lines. The action menu also exposes `Copy Enclosing Symbol` and `Add to Stage`. You can switch to CodeLens or a pure hover overlay with `copia.selectionActionsUi`.
- Diagnostic CodeLens
  On a line with diagnostics, Copia shows `Copy Diagnostic`.
- Editor context menu
  Right-click inside the editor and use the `Copia` submenu — selection actions, `Copy Enclosing Symbol`, and the stage commands are grouped there.
- Quick Fix / Code Action
  On a diagnostic location, use the lightbulb menu for diagnostic copy actions.
- Command Palette
  Search for `Copia`.
- Keyboard shortcut
  Press `Option+L` / `Alt+L` to run `Copia: Copy Relative Path`. Press `Option+Command+L` on macOS or `Alt+Shift+L` on Windows and Linux to run `Copia: Copy Path + Lines` when a selection is active. These defaults can be changed in VS Code Keyboard Shortcuts.
- Explorer / SCM context menu
  Right-click files, folders, or selected resources and use `Copia > Copy File Name`, `Copy Relative Path`, `Copy Absolute Path`, `Copy Bundle`, `Stage: Add File(s)`, or `Stage: Copy All`.
- Stage status bar
  Click `$(layers) Copia +N` (only visible when the stage is non-empty) to open the Manage panel.

## Usage

- In the editor, select some code to reveal the `Copia` selection actions entry in the status bar.
- You can also open the editor context menu to use `Copia`.
- In Explorer or SCM, right-click one or more resources and use `Copia > Copy File Name`, `Copy Relative Path`, `Copy Absolute Path`, or `Copy Bundle` to pack selected files into a single AI-friendly block sequence.
- Place the cursor inside a function / class and run `Copia: Copy Enclosing Symbol` (or pick it from the selection action menu) to copy the entire enclosing symbol as a `Copy Context` block.
- On a diagnostic location, use the lightbulb / Quick Fix menu or run `Copia: Copy Diagnostic` or `Copia: Copy Diagnostic + Code` from the Command Palette.
- Press `Option+L` / `Alt+L` to quickly copy the current file's relative path.
- Press `Option+Command+L` on macOS or `Alt+Shift+L` on Windows / Linux to copy `Path + Lines` for the current selection.
- Run `Copia: Quick Copy Active Reference` from the Command Palette, or bind your own shortcut, to use `copia.quickCopyActiveMode`.

### Stage workflow

The stage is the recommended way to compose AI prompts that need context from several places.

1. Run `Copia: Stage: Add Selection or File` (or `Add to Stage` from the selection action menu) to push the current selection / file. Use `Stage: Add Enclosing Symbol` to push the enclosing function / class instead, and `Stage: Add File(s)` from the Explorer context menu to push one or more whole files.
2. Watch the `$(layers) Copia +N` status bar entry update with the staged count.
3. When you are done collecting context, run `Copia: Stage: Copy All` (or click the status bar entry and pick `Copy Stage`) to copy everything as one bundle, separated by blank lines.
4. Use `Copia: Stage: Manage` to review staged items, remove individual entries, or clear the queue. The stage lives in memory only — it resets when the window reloads.

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

`Copy Bundle` joins one block per file with a blank line in between:

```text
file: @/src/a.ts
```ts
export const a = 1;
```

file: @/src/b.ts
```ts
export const b = 2;
```
```

`Stage: Copy All` produces the same shape: each staged item is concatenated in insertion order, separated by blank lines.

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
  Control how selection actions are shown. Available values: `statusBar`, `codeLens`, `hover`, `off`.
  - `hover` shows no visible UI and reveals the action menu only when hovering inside the selection.
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
  Select a single range and confirm the `Copia` status bar entry appears without shifting the editor. Toggle `copia.selectionActionsUi` through `codeLens` and `hover` and confirm each mode surfaces the actions as expected.
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
- Enclosing symbol
  Place the cursor inside a function / class in a TypeScript or Python file and run `Copia: Copy Enclosing Symbol`. Confirm the output is the entire function / class wrapped as a `Copy Context` block. In a file without a symbol provider, confirm Copia reports `No enclosing symbol found` instead of crashing.
- Diagnostics
  Put the cursor on a TypeScript or ESLint diagnostic and verify `Copy Diagnostic` works.
- Diagnostic with code
  Trigger `Copy Diagnostic + Code` and verify the code snippet is included.
- Explorer
  Right-click a file and a folder and verify `Copy File Name`, `Copy Relative Path`, and `Copy Absolute Path`.
- Explorer multiselect
  Multi-select resources and verify copied paths are line-separated.
- Bundle
  Multi-select 2-3 files in Explorer and run `Copia: Copy Bundle`. Confirm the clipboard contains one `file: @/...` heading + fenced code block per file, separated by blank lines, and that selected folders are skipped.
- Stage
  Run `Stage: Add Selection or File` in two different files, then `Stage: Copy All`, and confirm both entries appear in insertion order. Use `Stage: Manage` to remove one item and confirm the status bar count updates. Reload the window and confirm the stage is empty (memory only).
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
