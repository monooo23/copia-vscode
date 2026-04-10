# Copia

[English README](./README.md)

面向 AI 的 VS Code 上下文复制工具，支持从选区、诊断信息和资源列表中快速复制文件定位与代码内容。

## 功能

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

## 触发方式

- 选区 CodeLens
  选择单个非空选区后，会在选区上方显示 `Selection`、`Name`、`Lines`、`Chars`、`Context`。
- 诊断 CodeLens
  当某一行存在诊断信息时，会显示 `Copy Diagnostic`。
- 编辑器右键菜单
  在编辑器内右键后使用 `Copia` 子菜单。
- Quick Fix / Code Action
  在报错或告警位置使用灯泡菜单触发诊断复制。
- 命令面板
  搜索 `Copia`。
- 快捷键
  macOS 使用 `Option+L`，Windows / Linux 使用 `Alt+L` 触发 `Copia: Quick Copy Active Reference`。
- Explorer / SCM 右键菜单
  在文件、文件夹或 Git 变更项上右键后使用 `Copia > Copy File Name`、`Copy Relative Path` 或 `Copy Absolute Path`。

## 用法

- 在编辑器中选中一段代码，可直接使用上方的 CodeLens 快捷入口。
- 也可以通过编辑器右键菜单使用 `Copia`。
- 在 Explorer 或 SCM 中，右键一个或多个资源后使用 `Copia > Copy File Name`、`Copy Relative Path` 或 `Copy Absolute Path`。
- 在诊断位置，可以使用灯泡菜单，或者从命令面板运行 `Copia: Copy Diagnostic` / `Copia: Copy Diagnostic + Code`。
- 按 `Option+L` / `Alt+L` 可以快速复制当前激活引用，具体输出由 `copia.quickCopyActiveMode` 决定。

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

## 配置项

- `copia.maxCodeLines`
  控制 `Copy Context` 和 `Copy Diagnostic + Code` 最多保留多少行代码。默认值：`5`。设为 `0` 表示不截断。
- `copia.pathStyle`
  路径渲染模式。`workspaceRelative` 使用工作区相对路径，并允许 `@/` 锚点；`absolute` 使用绝对路径。
- `copia.padCopiedPathsWithSpaces`
  是否在路径类复制结果前后自动补空格。默认值：`true`。
- `copia.padCopiedContextWithBlankLines`
  是否在 `Copy Context`、`Copy Diagnostic + Code` 这类块内容前后自动补空行。默认值：`true`。
- `copia.enableSelectionCodeLens`
  是否启用选区 CodeLens。
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
  控制 `Option+L` / `Alt+L` 复制哪种格式。可选值：`singleLine`、`lineRange`、`charRange`、`context`。

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
  "copia.enableSelectionCodeLens": true,
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
  选择单个非空范围，确认选区 CodeLens 出现。
- 选区复制
  触发 `Copy Context`，确认输出以 `file: @/...#Lx:y-Lx:y` 开头。
- 截断
  选择超过 5 行的代码，确认代码块结尾为 `... N more lines`。
- 快捷键
  分别在有选区和无选区时按 `Option+L` / `Alt+L`，确认输出符合 `copia.quickCopyActiveMode`。
- 诊断
  将光标放到 TypeScript 或 ESLint 诊断位置，确认 `Copy Diagnostic` 可用。
- 诊断带代码
  触发 `Copy Diagnostic + Code`，确认结果中包含代码片段。
- Explorer
  右键文件和文件夹，确认 `Copy File Name`、`Copy Relative Path`、`Copy Absolute Path` 正常工作。
- Explorer 多选
  多选多个资源，确认复制结果按行分隔。
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
