import {
	expect,
	test
} from "@jest/globals";

import sdw from "../SQLDynamicWhere";

const dynamicWhere = new sdw();

test("Creating WHERE clause", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Equals, "Jacob");

	expect(dynamicWhere.getClausesWithValuePlaceholders()).toBe(" WHERE name = (?)");
	expect(dynamicWhere.getValues()[0]).toBe("Jacob");
});

test("Creating WHERE clause with leading operator", () => {
	dynamicWhere
		.clear()
		.and("color", sdw.Comparison.Equals, "red");

	expect(dynamicWhere.getClausesWithValuePlaceholders(false)).toBe(" AND color = (?)");
	expect(dynamicWhere.getValues()[0]).toBe("red");
});

test("Creating WHERE clause with multiple values", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Equals, "Kevan")
		.and("age", sdw.Comparison.GreaterThanOrEqual, 50)
		.or("height", sdw.Comparison.Equals, "4ft");

	expect(dynamicWhere.getClausesWithValuePlaceholders()).toBe(" WHERE name = (?) AND (age >= (?) OR height = (?))");
	expect(dynamicWhere.getValues()[0]).toBe("Kevan");
	expect(dynamicWhere.getValues()[1]).toBe(50);
	expect(dynamicWhere.getValues()[2]).toBe("4ft");
});

test("Creating WHERE clause with multiple values, some undefined", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Equals, "Parker")
		.and("age", sdw.Comparison.GreaterThanOrEqual, undefined)
		.or("height", sdw.Comparison.Equals, "6ft");

	expect(dynamicWhere.getClausesWithValuePlaceholders()).toBe(" WHERE (name = (?) OR height = (?))");
	expect(dynamicWhere.getValues()[0]).toBe("Parker");
	expect(dynamicWhere.getValues()[1]).toBe("6ft");
});

test("Creating WHERE clause with multiple values, some overrides", () => {
	dynamicWhere
		.clear()
		.and("make", sdw.Comparison.Equals, "Honda")
		.and("model", sdw.Comparison.GreaterThanOrEqual, "HRV", ["HRV"])
		.or("year", sdw.Comparison.Equals, 2022);

	expect(dynamicWhere.getClausesWithValuePlaceholders()).toBe(" WHERE (make = (?) OR year = (?))");
	expect(dynamicWhere.getValues()[0]).toBe("Honda");
	expect(dynamicWhere.getValues()[1]).toBe(2022);
});

test("Creating WHERE clause with multiple values, custom placeholder", () => {
	dynamicWhere
		.clear()
		.and("make", sdw.Comparison.Equals, "Honda")
		.and("model", sdw.Comparison.DoesNotEqual, "HRV")
		.or("year", sdw.Comparison.Equals, 2022);

	expect(dynamicWhere.getClausesWithValuePlaceholders(true, "%%PLACEHOLDER%%")).toBe(" WHERE make = %%PLACEHOLDER%% AND (model != %%PLACEHOLDER%% OR year = %%PLACEHOLDER%%)");
	expect(dynamicWhere.getValues()[0]).toBe("Honda");
	expect(dynamicWhere.getValues()[1]).toBe("HRV");
	expect(dynamicWhere.getValues()[2]).toBe(2022);
});

test("Creating WHERE clause using add first", () => {
	dynamicWhere
		.clear()
		.and("make", sdw.Comparison.Equals, "Honda")
		.or("year", sdw.Comparison.Equals, 2022);

	expect(dynamicWhere.getClausesWithValuePlaceholders()).toBe(" WHERE (make = (?) OR year = (?))");
	expect(dynamicWhere.getValues()[0]).toBe("Honda");
	expect(dynamicWhere.getValues()[1]).toBe(2022);
});

test("Creating WHERE clause using add first, show default leading operator", () => {
	dynamicWhere
		.clear()
		.and("make", sdw.Comparison.Equals, "Honda")
		.or("year", sdw.Comparison.Equals, 2022);

	expect(dynamicWhere.getClausesWithValuePlaceholders(false)).toBe(" AND (make = (?) OR year = (?))");
	expect(dynamicWhere.getValues()[0]).toBe("Honda");
	expect(dynamicWhere.getValues()[1]).toBe(2022);
});
