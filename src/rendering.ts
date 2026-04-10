export interface LocationShape {
  readonly pathRef: string;
  readonly startLine: number;
  readonly startChar: number;
  readonly endLine: number;
  readonly endChar: number;
}

export interface CodeBlockOptions {
  readonly maxLines?: number;
}

export interface DiagnosticMessageShape {
  readonly severity: string;
  readonly source?: string;
  readonly code?: string;
  readonly message: string;
}

export interface ReferenceTemplateOptions {
  readonly singleLineReferenceTemplate?: string;
  readonly lineRangeReferenceTemplate?: string;
  readonly charRangeReferenceTemplate?: string;
}

interface ReferenceTemplateContext extends LocationShape {
  readonly path: string;
  readonly startColumn: number;
  readonly endColumn: number;
}

const DEFAULT_SINGLE_LINE_REFERENCE_TEMPLATE = "file: ${pathRef}#L${startLine}";
const DEFAULT_LINE_RANGE_REFERENCE_TEMPLATE = "file: ${pathRef}#L${startLine}-L${endLine}";
const DEFAULT_CHAR_RANGE_REFERENCE_TEMPLATE = "file: ${pathRef}#L${startLine}:${startColumn}-L${endLine}:${endColumn}";

export function buildLineReference(
  context: Pick<ReferenceTemplateContext, "path" | "pathRef" | "startLine" | "endLine">,
  options?: ReferenceTemplateOptions,
): string {
  if (context.startLine === context.endLine) {
    return renderReferenceTemplate(
      options?.singleLineReferenceTemplate ?? DEFAULT_SINGLE_LINE_REFERENCE_TEMPLATE,
      {
        ...context,
        startChar: 1,
        endChar: 1,
        startColumn: 1,
        endColumn: 1,
      },
    );
  }

  return renderReferenceTemplate(
    options?.lineRangeReferenceTemplate ?? DEFAULT_LINE_RANGE_REFERENCE_TEMPLATE,
    {
      ...context,
      startChar: 1,
      endChar: 1,
      startColumn: 1,
      endColumn: 1,
    },
  );
}

export function buildLocationReference(context: ReferenceTemplateContext, options?: ReferenceTemplateOptions): string {
  return renderReferenceTemplate(
    options?.charRangeReferenceTemplate ?? DEFAULT_CHAR_RANGE_REFERENCE_TEMPLATE,
    context,
  );
}

export function buildCodeFence(content: string, languageId: string, options?: CodeBlockOptions): string {
  const renderedContent = truncateCodeBlockContent(content, options?.maxLines);
  const longestRun = Math.max(...Array.from(renderedContent.matchAll(/`+/g), (match) => match[0].length), 0);
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  const language = languageId === "plaintext" ? "" : languageId;

  return `${fence}${language}\n${renderedContent}\n${fence}`;
}

export function renderDiagnosticMessage(parts: DiagnosticMessageShape): string {
  const source = parts.source?.trim();
  const code = parts.code?.trim();

  if (source && code) {
    return `${parts.severity} ${source}(${code}): ${parts.message}`;
  }

  if (source) {
    return `${parts.severity} ${source}: ${parts.message}`;
  }

  if (code) {
    return `${parts.severity} ${code}: ${parts.message}`;
  }

  return `${parts.severity} ${parts.message}`;
}

export function surroundWithSpaces(value: string, enabled = true): string {
  if (!enabled) {
    return value;
  }

  return ` ${value} `;
}

export function surroundWithBlankLines(value: string, enabled = true): string {
  if (!enabled) {
    return value;
  }

  return `\n${value}\n`;
}

function truncateCodeBlockContent(content: string, maxLines?: number): string {
  if (!maxLines || maxLines < 1) {
    return content;
  }

  const lines = splitLines(content);
  if (lines.length <= maxLines) {
    return content;
  }

  const visibleLines = lines.slice(0, maxLines);
  const hiddenLineCount = lines.length - maxLines;

  return `${visibleLines.join("\n")}\n... ${hiddenLineCount} more lines`;
}

function splitLines(content: string): string[] {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  if (normalized.endsWith("\n")) {
    lines.pop();
  }

  return lines;
}

function renderReferenceTemplate(template: string, context: ReferenceTemplateContext): string {
  const replacements: Record<string, string> = {
    path: context.path,
    pathRef: context.pathRef,
    startLine: String(context.startLine),
    endLine: String(context.endLine),
    startChar: String(context.startChar),
    endChar: String(context.endChar),
    startColumn: String(context.startColumn),
    endColumn: String(context.endColumn),
  };

  return template.replace(/\$\{([a-zA-Z]+)\}/g, (match, key: string) => replacements[key] ?? match);
}
