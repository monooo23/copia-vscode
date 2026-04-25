import test from "node:test";
import assert from "node:assert/strict";

import { findEnclosingSymbol } from "../dist/symbol-tree.js";

const KIND = {
  Class: 4,
  Method: 5,
  Property: 6,
  Constructor: 8,
  Function: 11,
  Variable: 12,
  String: 14,
};

const PREFERRED = new Set([
  KIND.Function,
  KIND.Method,
  KIND.Class,
  KIND.Constructor,
]);

function sym(kind, contains, children = []) {
  return {
    kind,
    range: { contains: () => contains },
    children,
  };
}

test("findEnclosingSymbol returns undefined when nothing contains the position", () => {
  const tree = [sym(KIND.Class, false)];
  assert.equal(findEnclosingSymbol(tree, {}, PREFERRED), undefined);
});

test("findEnclosingSymbol prefers the deepest preferred kind, skipping properties and variables", () => {
  const tree = [
    sym(KIND.Class, true, [
      sym(KIND.Method, true, [
        sym(KIND.Variable, true, [
          sym(KIND.Property, true),
        ]),
      ]),
    ]),
  ];

  const matched = findEnclosingSymbol(tree, {}, PREFERRED);
  assert.equal(matched?.kind, KIND.Method);
});

test("findEnclosingSymbol falls back to the deepest containing symbol when no preferred kind matches", () => {
  const tree = [
    sym(KIND.Variable, true, [
      sym(KIND.Property, true),
    ]),
  ];

  const matched = findEnclosingSymbol(tree, {}, PREFERRED);
  assert.equal(matched?.kind, KIND.Property);
});

test("findEnclosingSymbol descends into the matching branch only", () => {
  const tree = [
    sym(KIND.Class, true, [
      sym(KIND.Method, false, [
        sym(KIND.Variable, true),
      ]),
      sym(KIND.Method, true, [
        sym(KIND.Variable, true),
      ]),
    ]),
  ];

  const matched = findEnclosingSymbol(tree, {}, PREFERRED);
  assert.equal(matched?.kind, KIND.Method);
});

test("findEnclosingSymbol picks the outermost preferred kind when no deeper preferred kind is present", () => {
  const tree = [
    sym(KIND.Class, true, [
      sym(KIND.Property, true),
    ]),
  ];

  const matched = findEnclosingSymbol(tree, {}, PREFERRED);
  assert.equal(matched?.kind, KIND.Class);
});

test("findEnclosingSymbol works on Markdown-style heading trees with no preferred kind", () => {
  const tree = [
    sym(KIND.String, true, [
      sym(KIND.String, true, [
        sym(KIND.String, false),
      ]),
    ]),
  ];

  const matched = findEnclosingSymbol(tree, {}, PREFERRED);
  assert.equal(matched?.kind, KIND.String);
});
