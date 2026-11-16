import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const tokens = await readFile(
  new URL("../../src/shared/styles/tokens.css", import.meta.url),
  "utf8",
);

test("responsive typography uses a fluid clamp scale", () => {
  assert.match(tokens, /--text-display:\s*clamp\(/);
});

test("page gutters scale with viewport while retaining a minimum and maximum", () => {
  assert.match(tokens, /--page-gutter:\s*clamp\(/);
});

test("shared controls expose a consistent minimum target height", () => {
  assert.match(tokens, /--control-min-height:\s*2\.75rem/);
});

test("keyboard focus receives a visible focus ring", () => {
  assert.match(tokens, /:focus-visible[^{]*\{[^}]*box-shadow:\s*var\(--focus-ring\)/s);
});

test("reduced-motion preference is respected", () => {
  assert.match(tokens, /prefers-reduced-motion:\s*reduce/);
});
