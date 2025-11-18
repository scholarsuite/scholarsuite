import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tryStringify } from "./json.ts";

describe("tryStringify", () => {
	it("should return the string as is", () => {
		const input = "Hello, World!";

		const result = tryStringify(input);

		assert.deepEqual(result, { ok: true, value: input });
	});

	it("should stringify a plain object", () => {
		const input = { foo: "bar", baz: 42 };

		const result = tryStringify(input);

		assert.deepEqual(result, {
			ok: true,
			value: JSON.stringify(input, null, 2),
		});
	});

	it("should stringify an array", () => {
		const input = [1, 2, 3];

		const result = tryStringify(input);

		assert.deepEqual(result, {
			ok: true,
			value: JSON.stringify(input, null, 2),
		});
	});

	it("should handle circular references gracefully", () => {
		const input: Record<string, unknown> = {};
		input.self = input; // Create a circular reference

		const result = tryStringify(input);

		assert.equal(result.ok, false);
		assert.match(result.error, /Converting circular structure to JSON/);
	});
});
