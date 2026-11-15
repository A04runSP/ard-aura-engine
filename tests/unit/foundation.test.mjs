import test from "node:test";
import assert from "node:assert/strict";
import { normalizePath, resolveRoute } from "../../src/shared/lib/routePath.mjs";

test("normalizes repeated and trailing slashes", () => {
  assert.equal(normalizePath("project-hub///"), "/project-hub");
  assert.equal(normalizePath("//"), "/");
  assert.equal(normalizePath("/"), "/");
});

test("resolves the Project Hub routes", () => {
  assert.equal(resolveRoute("/"), "project-hub");
  assert.equal(resolveRoute("/project-hub/"), "project-hub");
});

test("unknown paths resolve to the not-found state", () => {
  assert.equal(resolveRoute("/projects/123"), "not-found");
});
