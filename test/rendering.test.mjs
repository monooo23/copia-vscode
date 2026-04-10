import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCodeFence,
  buildLineReference,
  buildLocationReference,
  renderDiagnosticMessage,
  surroundWithBlankLines,
  surroundWithSpaces,
} from "../dist/rendering.js";

test("buildLineReference renders single-line anchor", () => {
  assert.equal(
    buildLineReference({
      path: "src/app.ts",
      pathRef: "@/src/app.ts",
      startLine: 12,
      endLine: 12,
    }),
    "file: @/src/app.ts#L12",
  );
});

test("buildLineReference renders multi-line anchor", () => {
  assert.equal(
    buildLineReference({
      path: "src/app.ts",
      pathRef: "@/src/app.ts",
      startLine: 12,
      endLine: 18,
    }),
    "file: @/src/app.ts#L12-L18",
  );
});

test("buildLocationReference renders AI-friendly file anchor", () => {
  assert.equal(
    buildLocationReference({
      path: "src/app.ts",
      pathRef: "@/src/app.ts",
      startLine: 12,
      startChar: 3,
      endLine: 18,
      endChar: 9,
      startColumn: 3,
      endColumn: 9,
    }),
    "file: @/src/app.ts#L12:3-L18:9",
  );
});

test("buildLocationReference supports custom templates", () => {
  assert.equal(
    buildLocationReference(
      {
        path: "src/app.ts",
        pathRef: "@/src/app.ts",
        startLine: 14,
        startChar: 1,
        endLine: 21,
        endChar: 5,
        startColumn: 1,
        endColumn: 5,
      },
      {
        charRangeReferenceTemplate: "${pathRef}#L${startLine}:${startColumn}-L${endLine}:${endColumn}",
      },
    ),
    "@/src/app.ts#L14:1-L21:5",
  );
});

test("buildCodeFence keeps language id and truncates long content", () => {
  const output = buildCodeFence("a\nb\nc\nd\ne\nf", "ts", { maxLines: 5 });

  assert.equal(output, "```ts\na\nb\nc\nd\ne\n... 1 more lines\n```");
});

test("buildCodeFence expands fence length when content includes backticks", () => {
  const output = buildCodeFence("```\nconst x = 1;\n```", "ts");

  assert.match(output, /^````ts\n/);
  assert.match(output, /\n````$/);
});

test("renderDiagnosticMessage includes severity, source and code", () => {
  assert.equal(
    renderDiagnosticMessage({
      severity: "warning",
      source: "eslint",
      code: "no-console",
      message: "Unexpected console statement.",
    }),
    "warning eslint(no-console): Unexpected console statement.",
  );
});

test("renderDiagnosticMessage falls back when source and code are missing", () => {
  assert.equal(
    renderDiagnosticMessage({
      severity: "error",
      message: "Something went wrong.",
    }),
    "error Something went wrong.",
  );
});

test("surroundWithSpaces adds spaces when enabled", () => {
  assert.equal(surroundWithSpaces("file: @/src/app.ts#L12", true), " file: @/src/app.ts#L12 ");
  assert.equal(surroundWithSpaces("file: @/src/app.ts#L12", false), "file: @/src/app.ts#L12");
});

test("surroundWithBlankLines adds blank lines when enabled", () => {
  assert.equal(surroundWithBlankLines("file: @/src/app.ts#L12\n```ts\nx\n```", true), "\nfile: @/src/app.ts#L12\n```ts\nx\n```\n");
  assert.equal(surroundWithBlankLines("file: @/src/app.ts#L12\n```ts\nx\n```", false), "file: @/src/app.ts#L12\n```ts\nx\n```");
});
