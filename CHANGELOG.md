# Changelog

## 0.0.1 — Initial release

First public release of Copia – Copy Context for AI.

### Path & selection
- `Copy File Name` / `Copy Relative Path` / `Copy Absolute Path` from the editor, Explorer, SCM, or Command Palette.
- `Copy Selection` / `Copy Path + Lines` / `Copy Path + Lines + Chars`.
- `Copy Context` — AI-friendly `file: @/...#Lx:y-Lx:y` reference plus a fenced code block tagged with the document's `languageId`.
- `Quick Copy Active Reference` with selectable mode (`singleLine` / `lineRange` / `charRange` / `context`).

### Symbol-aware
- `Copy Enclosing Symbol` resolves the smallest enclosing function / method / class / interface / module via `vscode.executeDocumentSymbolProvider`, falling back to the deepest containing symbol so Markdown / IaC files work too. Any language with a registered `DocumentSymbolProvider` is supported.

### Multi-file bundle
- `Copy Bundle` packs multi-selected files (or the active editor) into a single AI-friendly block sequence: one `file: @/...` heading + fenced code block per file, separated by blank lines. Folders and binary resources are silently skipped.

### Diagnostics
- `Copy Diagnostic` and `Copy Diagnostic + Code` from the diagnostic CodeLens, Quick Fix lightbulb, editor context menu, or Command Palette.
- When the cursor sits on multiple diagnostics, the disambig QuickPick offers a **Copy all N diagnostics** entry that bundles every diagnostic into one clipboard write.

### Stage workflow
- In-memory queue that accumulates selections, files, and symbols across the codebase before flushing them as one bundle.
- `Stage: Add Selection or File` / `Add Enclosing Symbol` / `Add File(s)` push into the stage.
- `$(layers) Copia +N` status bar entry shows the count and opens a Manage panel.
- `Stage: Copy All` / `Stage: Clear` / `Stage: Manage` for control.

### UX
- Selection actions surface as **status bar entry** (default), **CodeLens**, **hover overlay**, or off via `copia.selectionActionsUi`.
- Diagnostic CodeLens with severity filter (`error` / `errorAndWarning` / `all`).
- Three customizable reference templates with `${path}` / `${pathRef}` / `${startLine}` / `${endLine}` / `${startColumn}` / `${endColumn}` / `${startChar}` / `${endChar}` placeholders.
- Workspace-relative `@/` path anchor by default; switch to absolute with `copia.pathStyle`.
- Configurable code block truncation (`copia.maxCodeLines`, default 5; `0` disables).
