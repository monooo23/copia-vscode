import test from "node:test";
import assert from "node:assert/strict";

import { StageStore } from "../dist/stage-store.js";

function newStore() {
  let counter = 0;
  return new StageStore(() => `id-${++counter}`);
}

test("StageStore starts empty", () => {
  const store = newStore();
  assert.equal(store.count(), 0);
  assert.deepEqual(store.list(), []);
  assert.equal(store.bundle(), "");
});

test("StageStore.add appends and returns a staged item with an id", () => {
  const store = newStore();
  const a = store.add({ label: "A", content: "alpha" });
  const b = store.add({ label: "B", content: "beta" });

  assert.equal(a.id, "id-1");
  assert.equal(b.id, "id-2");
  assert.equal(store.count(), 2);
  assert.deepEqual(store.list().map((item) => item.label), ["A", "B"]);
});

test("StageStore.bundle joins contents with a blank line between them", () => {
  const store = newStore();
  store.add({ label: "A", content: "alpha" });
  store.add({ label: "B", content: "beta" });
  assert.equal(store.bundle(), "alpha\n\nbeta");
});

test("StageStore.remove removes by id and reports whether anything changed", () => {
  const store = newStore();
  store.add({ label: "A", content: "alpha" });
  const b = store.add({ label: "B", content: "beta" });

  assert.equal(store.remove(b.id), true);
  assert.equal(store.count(), 1);
  assert.equal(store.remove("nonexistent"), false);
});

test("StageStore.clear empties the store and reports whether anything changed", () => {
  const store = newStore();
  assert.equal(store.clear(), false);

  store.add({ label: "A", content: "alpha" });
  assert.equal(store.clear(), true);
  assert.equal(store.count(), 0);
});

test("StageStore.list returns items in insertion order", () => {
  const store = newStore();
  store.add({ label: "A", content: "alpha" });
  store.add({ label: "B", content: "beta" });
  store.add({ label: "C", content: "gamma" });
  assert.deepEqual(store.list().map((item) => item.label), ["A", "B", "C"]);
});
