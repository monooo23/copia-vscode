import test from "node:test";
import assert from "node:assert/strict";

import { buildWorkspaceRelativePath, normalizePath } from "../dist/pathing.js";

test("buildWorkspaceRelativePath keeps plain relative path in single-root workspaces", () => {
  assert.equal(
    buildWorkspaceRelativePath("src/app.ts", "app.ts", "a", false),
    "src/app.ts",
  );
});

test("buildWorkspaceRelativePath prefixes workspace folder name in multi-root workspaces", () => {
  assert.equal(
    buildWorkspaceRelativePath("src/app.ts", "app.ts", "a", true),
    "a/src/app.ts",
  );
});

test("buildWorkspaceRelativePath falls back to basename for root-level resources", () => {
  assert.equal(
    buildWorkspaceRelativePath("", "app.ts", "a", true),
    "a/app.ts",
  );
});

test("normalizePath converts backslashes to forward slashes", () => {
  assert.equal(normalizePath("a\\src\\app.ts"), "a/src/app.ts");
});
