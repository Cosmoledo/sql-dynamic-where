import {
	expect,
	test
} from "@jest/globals";

import sdw from "../SQLDynamicWhere";

const dynamicWhere = new sdw();

test("Adding a new clause with real value", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Equals, "Jacob");

	expect(dynamicWhere.getClausesArray().length).toBe(1);
	expect(dynamicWhere.getValues().length).toBe(1);
});

test("Adding a new clause with empty values", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Equals, undefined)
		.or("age", sdw.Comparison.LessThan, null);

	expect(dynamicWhere.getClausesArray().length).toBe(0);
	expect(dynamicWhere.getValues().length).toBe(0);
});

test("Adding a new clause with override values", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Equals, "Jacob", ["Jacob"])
		.or("name", sdw.Comparison.DoesNotEqual, "Kevan");

	expect(dynamicWhere.getClausesArray().length).toBe(1);
	expect(dynamicWhere.getValues().length).toBe(1);
});

test("Adding a new clause with no leading logic operator", () => {
	dynamicWhere
		.clear()
		.and("color", sdw.Comparison.Equals, "green");

	expect(dynamicWhere.getClausesArray().length).toBe(1);
	expect(dynamicWhere.getValues().length).toBe(1);
});
