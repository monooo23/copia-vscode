# Copia

[English README](./README.md)

面向 AI 的 VS Code 上下文复制工具，支持从选区、诊断信息和资源列表中快速复制文件定位与代码内容。

## 功能

路径与选区
- `Copia: Copy File Name`
- `Copia: Copy Relative Path`
- `Copia: Copy Absolute Path`
- `Copia: Copy Selection`
- `Copia: Copy Path + Lines`
- `Copia: Copy Path + Lines + Chars`
- `Copia: Copy Context`
- `Copia: Quick Copy Active Reference`

按符号复制
- `Copia: Copy Enclosing Symbol` —— 复制光标所在的最深 function / method / class / interface / module，输出格式与 `Copy Context` 一致；当没有命中偏好符号类型时退化到最深的包围符号。任何向 VS Code 注册了 `DocumentSymbolProvider` 的语言都能用：TypeScript / JavaScript / Markdown VS Code 自带，Python / Go / Rust / C++ / Java 等装上对应语言扩展即生效。

多文件 bundle
- `Copia: Copy Bundle` —— 把多选的资源（或当前激活文件）按统一格式打包成一段适合发给 AI 的内容。复用 `Copy Context` 的 fence 与 `copia.maxCodeLines` 截断逻辑，遇到文件夹或二进制资源会静默跳过。

诊断
- `Copia: Copy Diagnostic`
- `Copia: Copy Diagnostic + Code`

Stage（多步骤上下文整理）
- `Copia: Stage: Add Selection or File`
- `Copia: Stage: Add Enclosing Symbol`
- `Copia: Stage: Add File(s)`
- `Copia: Stage: Copy All`
- `Copia: Stage: Clear`
- `Copia: Stage: Manage`

Stage 是一个内存级队列，允许你把跨文件的选区、整文件、符号陆续累积起来，最后一次性复制为一整段 bundle。只要 stage 非空，状态栏就会显示 `$(layers) Copia +N`，点击进入 Manage 面板可以预览、删除、复制或清空。

## 触发方式

- 选区动作入口
  默认情况下，选择单个非空选区后，会在状态栏显示 `Copia` 入口，不会把编辑器内容往下顶。动作菜单里同时包含 `Copy Enclosing Symbol` 与 `Add to Stage`。你也可以通过 `copia.selectionActionsUi` 切换到 CodeLens 或纯 hover 浮层。
- 诊断 CodeLens
  当某一行存在诊断信息时，会显示 `Copy Diagnostic`。
- 编辑器右键菜单
  在编辑器内右键后使用 `Copia` 子菜单 —— 选区动作、`Copy Enclosing Symbol`、stage 命令都收纳在这里。
- Quick Fix / Code Action
  在报错或告警位置使用灯泡菜单触发诊断复制。
- 命令面板
  搜索 `Copia`。
- 快捷键
  macOS 使用 `Option+L`，Windows / Linux 使用 `Alt+L` 触发 `Copia: Copy Relative Path`。有选区时，macOS 使用 `Option+Command+L`，Windows / Linux 使用 `Alt+Shift+L` 触发 `Copia: Copy Path + Lines`。这些默认快捷键都可以在 VS Code Keyboard Shortcuts 中修改。
- Explorer / SCM 右键菜单
  在文件、文件夹或 Git 变更项上右键后使用 `Copia > Copy File Name`、`Copy Relative Path`、`Copy Absolute Path`、`Copy Bundle`、`Stage: Add File(s)` 或 `Stage: Copy All`。
- Stage 状态栏入口
  Stage 非空时点击 `$(layers) Copia +N` 即可打开 Manage 面板。

## 用法

- 在编辑器中选中一段代码，可直接使用状态栏中的 `Copia` 选区动作入口。
- 也可以通过编辑器右键菜单使用 `Copia`。
- 在 Explorer 或 SCM 中，右键一个或多个资源后使用 `Copia > Copy File Name`、`Copy Relative Path`、`Copy Absolute Path` 或 `Copy Bundle`，将选中的多个文件按统一格式打包成一段 AI 友好的内容。
- 把光标放在某个函数 / 类内部，运行 `Copia: Copy Enclosing Symbol`（或在选区动作菜单里点击同名条目），就能把整个包围符号按 `Copy Context` 的格式复制下来。
- 在诊断位置，可以使用灯泡菜单，或者从命令面板运行 `Copia: Copy Diagnostic` / `Copia: Copy Diagnostic + Code`。
- 按 `Option+L` / `Alt+L` 可以快速复制当前文件的相对路径。
- 有选区时，按 `Option+Command+L` / `Alt+Shift+L` 可以快速复制 `Path + Lines`。
- 如果要用 `copia.quickCopyActiveMode`，请从命令面板运行 `Copia: Quick Copy Active Reference`，或者自行给它绑定快捷键。

### Stage 工作流

当你需要给 AI 准备的提示词跨多个文件 / 多段代码时，推荐用 stage 拼装：

1. 运行 `Copia: Stage: Add Selection or File`（或在选区动作菜单点 `Add to Stage`）把当前选区 / 当前文件压入 stage。想把整个函数 / 类压进去用 `Stage: Add Enclosing Symbol`；要把若干整文件压进去就在 Explorer 多选后使用 `Stage: Add File(s)`。
2. 状态栏的 `$(layers) Copia +N` 会同步更新计数。
3. 收集完毕后运行 `Copia: Stage: Copy All`（或点击状态栏入口选 `Copy Stage`），所有片段会按加入顺序拼成一段、用空行分隔的 bundle 一次性复制。
4. 用 `Copia: Stage: Manage` 可以预览、删除、整体复制或清空 stage。Stage 仅存在内存中，重新加载窗口后会清空。

## 输出格式

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

## 配置项

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

## 验证清单

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

## 已知限制

- 暂不支持多选区复制。
- 没有实现自定义浮动工具条，目前使用 VS Code 原生入口和 CodeLens。
- Explorer / SCM 多选行为仍建议在真实 Extension Host 里覆盖更多仓库形态再验证一轮。

## 开发

```bash
npm install
npm run compile
npm test
```

然后在 VS Code 中按 `F5` 启动 Extension Host。

可用任务：

- `npm: compile`
- `npm: watch`
- `npm: check`
