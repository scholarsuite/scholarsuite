import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatRelative } from "./datetime.ts";

describe("formatRelative", () => {
	it("should format relative times correctly", () => {
		const now = new Date().toISOString();

		// Just now
		assert.strictEqual(formatRelative(now, "en"), "1 sec. ago");

		// 30 seconds ago
		const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
		assert.strictEqual(formatRelative(thirtySecondsAgo, "en"), "30 sec. ago");

		// 5 minutes ago
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
		assert.strictEqual(formatRelative(fiveMinutesAgo, "en"), "5 min. ago");

		// 2 hours ago
		const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
		assert.strictEqual(formatRelative(twoHoursAgo, "en"), "2 hr. ago");

		// 3 days ago
		const threeDaysAgo = new Date(
			Date.now() - 3 * 24 * 60 * 60 * 1000,
		).toISOString();
		assert.strictEqual(formatRelative(threeDaysAgo, "en"), "3 days ago");
	});
});
