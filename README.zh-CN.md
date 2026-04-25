# Copia – 给 AI 用的代码上下文复制器

[English README](./README.md)

别再手动整理文件路径和行号往 AI 对话框里贴了！**Copia** 把任意代码、选区、符号、诊断一键变成 AI 友好的上下文格式 —— 还能跨文件把多段片段攒到 stage 里，一次性打成一个大 bundle 发给 AI。

> 为你和 Claude / Cursor / Copilot / ChatGPT 的真实对话方式而做。

## ✨ 功能

### 📋 一键拷出 AI 友好的上下文

- **选区上下文**：`file: @/src/app.ts#L24:7-L24:15` + 带语言标签的 fenced code block。
- **路径 + 行范围**：适合"看下这一段"的轻量引用。
- **仅路径 / 文件名**：经典复制，工作区相对路径默认带 `@/` 锚点。
- **Quick Copy Active Reference**：一个快捷键，按 `copia.quickCopyActiveMode` 输出你最常用的格式。

### 🧠 按符号复制

- **`Copy Enclosing Symbol`** 通过 VS Code 的 `DocumentSymbolProvider` 找到光标所在的最深 function / method / class / interface / module，把整个符号按 `Copy Context` 格式复制下来。
- **任何向 VS Code 提供符号树的语言都能用** —— TypeScript / JavaScript / Markdown VS Code 自带，Python / Go / Rust / C++ / Java 等装上对应语言扩展即生效。
- 没命中偏好符号类型时优雅退化到最深包围符号（适合 Markdown heading、IaC 等场景）。

### 🪢 多文件 Bundle

- **`Copy Bundle`** 把多选的资源（或当前激活文件）按统一格式打包成一段 AI 友好的内容 —— 每个文件一段 `file: @/...` 头 + fenced code block，段间空行分隔。
- 复用 `Copy Context` 的 fence 与 `copia.maxCodeLines` 截断逻辑，文件夹和二进制资源自动跳过。

### 🩺 诊断 + 代码一起复制

- **`Copy Diagnostic`** / **`Copy Diagnostic + Code`** —— 复制 `severity source(code): message` + 出错代码，从诊断 CodeLens 或 Quick Fix 一键触发。
- 当同一位置存在多条诊断时，弹出的 QuickPick 顶部多了 **Copy all N diagnostics** 入口，把所有诊断一次性打包。

### 🪄 Stage：跨文件渐进式拼装提示词

Stage 是一个内存级队列，把**跨文件的选区、文件、符号陆续累积**起来，最后一次性复制为一整段 bundle。当 AI 提示词需要来自多处的上下文时，这是杀手级功能。

- `Stage: Add Selection or File` / `Add Enclosing Symbol` / `Add File(s)` 入栈。
- 状态栏 `$(layers) Copia +N` 实时显示计数，点击打开 Manage 面板。
- `Stage: Copy All` 一次性把所有片段拼成 bundle 复制走，段间空行分隔。
- `Stage: Manage` 可以预览、删除、整体复制或清空。

### 🎯 高度可配置 + 入口可发现

- 选区动作可选择 **状态栏**（默认）/ **CodeLens** / **hover** / 关闭。
- **三个完全可定制的引用模板**：单行、行范围、字符范围。
- 诊断 CodeLens 支持按严重程度过滤（`error` / `errorAndWarning` / `all`）。
- 代码块截断行数 `copia.maxCodeLines`（默认 5；设 `0` 关闭截断）。

## 🚀 快速上手

1. **安装** Copia（VS Code Marketplace）。
2. **选中一段代码**，状态栏出现 `$(copy) Copia` —— 点击展开所有选区动作的 QuickPick，或右键用 `Copia` 子菜单。
3. **试试 `Copy Context`**。剪贴板里就是文件引用 + fenced code block，可以直接粘到 Claude / Cursor / Copilot / ChatGPT。
4. **想要更多上下文？** `Stage: Add Selection or File` 一次，跳到另一个文件再来一次，最后 `Stage: Copy All` —— 两段片段以一个 bundle 形式落到剪贴板。

整个产品就这么简单。剩下的都是细节打磨。

## 🎬 触发方式

Copia 把所有命令通过 VS Code 原生入口都暴露出来，你不需要记任何路径：

| 入口 | 能做什么 |
|---|---|
| **状态栏选区动作** | 选中代码后出现 `$(copy) Copia`，点击弹出所有选区动作的 QuickPick，包括 `Copy Enclosing Symbol` 和 `Add to Stage`。可通过 `copia.selectionActionsUi` 切换到 `codeLens` / `hover` / `off`。 |
| **Stage 状态栏** | Stage 非空时出现 `$(layers) Copia +N`，点击进入 Manage 面板。 |
| **编辑器右键菜单** | 右键 → `Copia` 子菜单收纳了选区动作、`Copy Enclosing Symbol` 与 stage 命令。 |
| **诊断 CodeLens** | 有诊断的行上方显示 `$(error) Copy Diagnostic`。`copia.diagnosticCodeLensSeverity` 控制显示范围。 |
| **Quick Fix / Code Action** | 诊断位置的灯泡菜单提供 `Copia: Copy Diagnostic` 与 `Copy Diagnostic + Code`。 |
| **Explorer / SCM 右键菜单** | 在文件 / 文件夹 / 多选资源上右键 → `Copia` 子菜单提供路径 / bundle / stage 操作。 |
| **命令面板** | 搜索 `Copia`。 |
| **快捷键** | `Option+L` / `Alt+L` 复制相对路径；`Option+Command+L`（macOS）/ `Alt+Shift+L`（Win/Linux）有选区时复制 `Path + Lines`。其他自己绑。 |

## 🪄 Stage 工作流

当你需要给 AI 准备的提示词跨多个文件 / 多段代码时，推荐用 stage 拼装：

1. **入栈** —— `Copia: Stage: Add Selection or File`（或选区动作菜单点 `Add to Stage`）把当前选区 / 当前文件压入。`Stage: Add Enclosing Symbol` 压入整个函数 / 类；Explorer 里多选后用 `Stage: Add File(s)` 压入若干整文件。
2. **跟踪** —— 状态栏 `$(layers) Copia +N` 同步显示计数。
3. **取出** —— `Copia: Stage: Copy All`（或点击状态栏入口选 `Copy Stage`）一次性复制所有片段，段间空行分隔。
4. **管理** —— `Copia: Stage: Manage` 可以预览、单条删除、清空。

Stage 仅存在内存中，重新加载窗口后会清空。

## 📤 输出格式

`Copy Path + Lines` 默认输出：

```text
file: @/src/example.ts#L3-L5
```

`Copy Path + Lines + Chars` 默认输出：

```text
file: @/src/example.ts#L3:1-L5:12
```

`Copy Context` 和 `Copy Diagnostic + Code` 默认输出：

```text
file: @/src/example.ts#L3:1-L5:12
```

```ts
const value = getValue();
console.log(value);
```

如果复制的代码过长，默认只保留前 5 行，并在末尾追加类似 `... 85 more lines` 的折叠提示。可以通过 `copia.maxCodeLines` 修改；设为 `0` 表示不截断。

`Copy Bundle` 把每个文件拼成一段，段间用空行分隔：

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

`Stage: Copy All` 输出格式相同：每个 staged 条目按加入顺序拼接，段间一行空行。

## ⚙️ 配置项

- `copia.maxCodeLines`
  控制 `Copy Context` 和 `Copy Diagnostic + Code` 最多保留多少行代码。默认值：`5`。设为 `0` 表示不截断。
- `copia.pathStyle`
  路径渲染模式。`workspaceRelative` 使用工作区相对路径，并允许 `@/` 锚点；`absolute` 使用绝对路径。
- `copia.padCopiedPathsWithSpaces`
  是否在路径类复制结果前后自动补空格。默认值：`true`。
- `copia.padCopiedContextWithBlankLines`
  是否在 `Copy Context`、`Copy Diagnostic + Code` 这类块内容前后自动补空行。默认值：`true`。
- `copia.selectionActionsUi`
  控制选区动作入口的显示方式。可选值：`statusBar`、`codeLens`、`hover`、`off`。
  - `hover` 不显示任何 UI，仅在 hover 选区内部时弹出动作菜单。
- `copia.enableDiagnosticCodeLens`
  是否启用诊断 CodeLens。
- `copia.showDiagnosticCodeLensMessage`
  是否显示 `Copy Diagnostic` 右侧的精简诊断消息。
- `copia.diagnosticCodeLensSeverity`
  控制诊断 CodeLens 显示范围，可选 `error`、`errorAndWarning`、`all`。
- `copia.singleLineReferenceTemplate`
  单行引用模板。默认值：`file: ${pathRef}#L${startLine}`。
- `copia.lineRangeReferenceTemplate`
  多行引用模板。默认值：`file: ${pathRef}#L${startLine}-L${endLine}`。
- `copia.charRangeReferenceTemplate`
  字符范围引用模板。默认值：`file: ${pathRef}#L${startLine}:${startColumn}-L${endLine}:${endColumn}`。
- `copia.quickCopyActiveMode`
  控制 `Copia: Quick Copy Active Reference` 复制哪种格式。可选值：`singleLine`、`lineRange`、`charRange`、`context`。

## 模板变量

- `${path}`
  展示用路径，例如 `services/loopit/lite/templates/package.2d.json`
- `${pathRef}`
  面向 AI 的路径引用，例如 `@/services/loopit/lite/templates/package.2d.json`
- `${startLine}` / `${endLine}`
  1-based 行号
- `${startColumn}` / `${endColumn}`
  1-based 列号
- `${startChar}` / `${endChar}`
  `${startColumn}` / `${endColumn}` 的别名

## 模板示例

- 单行

```json
"copia.singleLineReferenceTemplate": "file: ${pathRef}#L${startLine}"
```

- 多行

```json
"copia.lineRangeReferenceTemplate": "file: ${pathRef}#L${startLine}-L${endLine}"
```

- 字符范围

```json
"copia.charRangeReferenceTemplate": "${pathRef}#L${startLine}:${startColumn}-L${endLine}:${endColumn}"
```

完整设置示例：

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

## ✅ 验证清单

- 选区
  选择单个非空范围，确认状态栏中的 `Copia` 入口出现且不会把编辑器内容往下顶；将 `copia.selectionActionsUi` 依次切到 `codeLens`、`hover`，确认对应的入口都能正确展示。
- 选区复制
  触发 `Copy Context`，确认输出以 `file: @/...#Lx:y-Lx:y` 开头。
- 截断
  选择超过 5 行的代码，确认代码块结尾为 `... N more lines`。
- 相对路径快捷键
  按 `Option+L` / `Alt+L`，确认复制的是当前文件的相对路径。
- Path + Lines 快捷键
  在有选区时，macOS 按 `Option+Command+L`，Windows / Linux 按 `Alt+Shift+L`，确认复制的是 `Path + Lines`。
- Quick Copy Active Reference
  从命令面板运行 `Copia: Quick Copy Active Reference`，或自行给它绑定快捷键，确认输出符合 `copia.quickCopyActiveMode`。
- Enclosing Symbol
  在 TypeScript 或 Python 文件中，把光标放进某个函数 / 类内部，运行 `Copia: Copy Enclosing Symbol`，确认输出是整个函数 / 类，并按 `Copy Context` 格式包装；在没有 symbol provider 的文件里，确认插件返回 `No enclosing symbol found` 而不是抛错。
- 诊断
  将光标放到 TypeScript 或 ESLint 诊断位置，确认 `Copy Diagnostic` 可用。
- 诊断带代码
  触发 `Copy Diagnostic + Code`，确认结果中包含代码片段。
- Explorer
  右键文件和文件夹，确认 `Copy File Name`、`Copy Relative Path`、`Copy Absolute Path` 正常工作。
- Explorer 多选
  多选多个资源，确认复制结果按行分隔。
- Bundle
  在 Explorer 多选 2-3 个文件后运行 `Copia: Copy Bundle`，确认剪贴板内容是每个文件一段 `file: @/...` + fence 的代码块，段间用空行分隔，且文件夹会被跳过。
- Stage
  分别在两个文件里运行 `Stage: Add Selection or File`，再触发 `Stage: Copy All`，确认两条片段按加入顺序出现；在 `Stage: Manage` 里删除一条，确认状态栏计数同步更新；重新加载窗口后确认 stage 已清空（仅内存）。
- SCM
  在 SCM 里右键变更文件，确认 `Copy File Name`、`Copy Relative Path`、`Copy Absolute Path` 正常工作。

## 📌 已知限制

- 暂不支持多光标 / 多选区复制（只取主选区）。
- Stage 仅存在内存中，重新加载窗口会清空。
- `Copy Bundle` 会静默跳过文件夹和二进制资源 —— 只打包可读文本文件。
- 没有实现自定义浮动工具条；Copia 全部走 VS Code 原生入口（状态栏 / CodeLens / hover / 右键菜单 / Quick Fix）。

## 🛠️ 开发

```bash
npm install
npm run compile
npm test
```

然后在 VS Code 中按 `F5` 启动 Extension Host。可用脚本：`npm: compile`、`npm: watch`、`npm: check`、`npm test`。

## 🔗 同作者其他扩展

- **[Linker – Smart Code Linking](https://marketplace.visualstudio.com/items?itemName=sharten.linker)** —— 通过简单的 JSON 配置，把代码里的任意文本变成跳转到文档 / 文件 / API / Issue 的可点击链接。

---

**别再手动整理路径行号 —— 用 Copia 一键把干净的上下文塞给 AI！** 🚀
