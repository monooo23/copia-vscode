# Copia – Copy Context for AI

[中文 README](./README.zh-CN.md)

Stop hand-copying file paths and line numbers for your AI prompts! **Copia** turns any code, selection, symbol, or diagnostic into the AI-friendly context format your assistant actually wants — and lets you stage snippets across files into one bundle for richer prompts.

> Built for the way you actually talk to Claude, Cursor, Copilot, and ChatGPT.

## ✨ Features

### 📋 Copy Anything in AI-Friendly Format

- **Selection context**: `file: @/src/app.ts#L24:7-L24:15` plus a fenced code block with the right language tag.
- **Path + line range**: handy short references for "look at this region" prompts.
- **Path-only / file name**: classic copies, polished defaults (workspace-relative `@/...` prefix).
- **Quick Copy Active Reference**: one shortcut, your preferred mode (`copia.quickCopyActiveMode`).

### 🧠 Symbol-Aware Copy

- **`Copy Enclosing Symbol`** finds the smallest enclosing function / method / class / interface / module via VS Code's `DocumentSymbolProvider` and copies the entire symbol as a `Copy Context` block.
- Works for **every language whose extension provides symbols** — TypeScript / JavaScript / Markdown ship with VS Code; Python / Go / Rust / C++ / Java / etc. work the moment their language extension is installed.
- Falls back gracefully to the deepest containing symbol when no preferred kind matches (useful for Markdown headings, IaC, etc.).

### 🪢 Multi-File Bundle

- **`Copy Bundle`** packs multi-selected files (or the active editor) into a single AI-friendly block sequence — one `file: @/...` heading + fenced code block per file, separated by blank lines.
- Shares the same fence and `copia.maxCodeLines` truncation pipeline as `Copy Context`. Folders and binary resources are skipped silently.

### 🩺 Diagnostic Copy with Code

- **`Copy Diagnostic`** / **`Copy Diagnostic + Code`** — copy `severity source(code): message` plus the offending code, all behind one click on the diagnostic CodeLens or Quick Fix.
- When multiple diagnostics share a location, the disambig QuickPick offers a **Copy all N diagnostics** entry that bundles every diagnostic in one go.

### 🪄 Stage: Build Multi-Snippet Prompts Incrementally

The stage is an in-memory queue that accumulates **selections, files, and symbols across the codebase** before copying them as one big bundle. The killer feature when your AI prompt needs context from several places.

- `Stage: Add Selection or File` / `Add Enclosing Symbol` / `Add File(s)` to push.
- A `$(layers) Copia +N` status bar entry shows the count and opens the Manage panel.
- `Stage: Copy All` flushes everything as a single clipboard write, separated by blank lines.
- `Stage: Manage` lets you review, remove, copy, or clear items.

### 🎯 Configurable & Discoverable

- Selection actions surface as **status bar entry** (default), **CodeLens**, **hover overlay**, or off — your choice.
- Three **fully customizable reference templates**: single-line, line-range, char-range.
- Diagnostic CodeLens with severity filter (`error` / `errorAndWarning` / `all`).
- Code block truncation with `copia.maxCodeLines` (default 5; `0` disables).

## 🚀 Quick Start

1. **Install** Copia from the VS Code Marketplace.
2. **Select some code** in any file. A `$(copy) Copia` entry appears in the status bar — click it for a menu of all selection actions, or just right-click to use the `Copia` submenu.
3. **Try `Copy Context`**. The clipboard now contains the file reference plus a fenced code block, ready to paste into Claude / Cursor / Copilot / ChatGPT.
4. **Want more context?** Hit `Stage: Add Selection or File`, jump to another file, hit it again, then `Stage: Copy All` — both snippets land in the clipboard as one bundle.

That's the whole product. The rest is just polish.

## 🎬 Trigger Modes

Copia exposes its commands through every native VS Code surface so you never have to memorize a path:

| Surface | What you get |
|---|---|
| **Status bar selection actions** | `$(copy) Copia` appears when you make a selection. Click for a QuickPick of every selection action, including `Copy Enclosing Symbol` and `Add to Stage`. Toggle with `copia.selectionActionsUi` to `codeLens`, `hover`, or `off`. |
| **Stage status bar** | `$(layers) Copia +N` appears whenever the stage is non-empty. Click to manage. |
| **Editor context menu** | Right-click → `Copia` submenu groups selection actions, `Copy Enclosing Symbol`, and stage commands. |
| **Diagnostic CodeLens** | Lines with diagnostics show `$(error) Copy Diagnostic` directly above the code. Severity filter via `copia.diagnosticCodeLensSeverity`. |
| **Quick Fix / Code Action** | Lightbulb on a diagnostic offers `Copia: Copy Diagnostic` and `Copy Diagnostic + Code`. |
| **Explorer / SCM context menu** | Right-click files (or multi-selected resources) → `Copia` submenu for path / bundle / stage actions. |
| **Command Palette** | Search `Copia`. |
| **Keyboard shortcuts** | `Option+L` / `Alt+L` for relative path. `Option+Command+L` (macOS) / `Alt+Shift+L` (Win/Linux) for `Path + Lines` when a selection is active. Bind anything else yourself. |

## 🪄 Stage Workflow

The stage is the recommended way to compose AI prompts that need context from several places.

1. **Push** — `Copia: Stage: Add Selection or File` (or `Add to Stage` from the selection action menu) pushes the current selection / file. Use `Stage: Add Enclosing Symbol` to push the enclosing function / class, and `Stage: Add File(s)` from the Explorer context menu to push whole files.
2. **Track** — `$(layers) Copia +N` in the status bar updates with the count.
3. **Flush** — `Copia: Stage: Copy All` (or click the status bar entry and pick `Copy Stage`) copies everything as one bundle, separated by blank lines.
4. **Manage** — `Copia: Stage: Manage` lets you review items, remove entries one by one, or clear the queue.

The stage lives in memory only — reloading the window resets it.

## 📤 Output Formats

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

## ⚙️ Settings

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

## ✅ Validation Checklist

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

## 📌 Known Limits

- Multi-cursor / multi-selection copy is not supported yet (only the primary selection is used).
- The stage is in-memory only and resets when the window reloads.
- `Copy Bundle` skips folders and binary resources silently — it ships only readable files.
- Rich floating toolbars are not implemented; Copia uses VS Code-native entry points (status bar / CodeLens / hover / context menus / Quick Fix).

## 🛠️ Development

```bash
npm install
npm run compile
npm test
```

Then press `F5` in VS Code to launch the extension host. Available scripts: `npm: compile`, `npm: watch`, `npm: check`, `npm test`.

## 🔗 More from sharten

- **[Linker – Smart Code Linking](https://marketplace.visualstudio.com/items?itemName=sharten.linker)** — turn any text in your code into a clickable link to docs, files, APIs, or tickets through simple JSON config.

---

**Stop hand-copying paths and line numbers — let Copia ship clean context to your AI in one click.** 🚀
