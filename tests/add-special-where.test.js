import {
	expect,
	test
} from "@jest/globals";

import sdw from "../SQLDynamicWhere";

const dynamicWhere = new sdw();

test("Adding a clause using LIKE", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Like, "Jacob");

	expect(dynamicWhere.getClausesArray().length).toBe(1);
	expect(dynamicWhere.getValues().length).toBe(1);
});

test("Adding a clause using LIKE with wildcards", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Like, "%Jacob%");

	expect(dynamicWhere.getClausesArray().length).toBe(1);
	expect(dynamicWhere.getValues().length).toBe(1);
});

test("Adding a empty clause using IS", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.IsNull, false);

	expect(dynamicWhere.getClausesArray().length).toBe(0);
	expect(dynamicWhere.getValues().length).toBe(0);
});

test("Adding a clause using IS", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.IsNotNull, true);

	expect(dynamicWhere.getClausesArray().length).toBe(1);
	expect(dynamicWhere.getValues().length).toBe(1);
});

test("Adding a clause using IN", () => {
	dynamicWhere
		.clear()
		.and("friends", sdw.Comparison.In, ["Luke", "Leia", "James"]);

	expect(dynamicWhere.getClauses()).toBe(" WHERE friends IN (\"Luke\", \"Leia\", \"James\")");
});

test("Adding a clause using IN placeholder", () => {
	dynamicWhere
		.clear()
		.and("friends", sdw.Comparison.In, ["Luke", "Leia", "James"]);

	expect(dynamicWhere.getClausesWithValuePlaceholders()).toBe(" WHERE friends IN (?)");
});

test("Adding a clause using IN with skip", () => {
	dynamicWhere
		.clear()
		.and("friends", sdw.Comparison.In, ["Luke", "Leia", "James"], ["Leia"]);

	expect(dynamicWhere.getClauses()).toBe(" WHERE friends IN (\"Luke\", \"James\")");
});

test("Adding a empty clause using IN", () => {
	dynamicWhere
		.clear()
		.and("friends", sdw.Comparison.In, ["Leia"], ["Leia"]);

	expect(dynamicWhere.getClauses()).toBe(" WHERE");
});

test("Adding a clause using IS and LIKE", () => {
	dynamicWhere
		.clear()
		.and("deleted", sdw.Comparison.IsNotNull, true)
		.and("canFly", sdw.Comparison.IsNull, undefined)
		.and("name", sdw.Comparison.Like, "%Jacob%");

	expect(dynamicWhere.getClauses()).toBe(" WHERE deleted IS NOT NULL AND name LIKE \"%Jacob%\"");
});

test("Test for correct OR logic", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Equals, "Jacob")
		.and("age", sdw.Comparison.LessThan, 25)
		.or("age", sdw.Comparison.GreaterThan, 50)
		.and("hasParents", sdw.Comparison.IsNotNull, true);

	expect(dynamicWhere.getClauses()).toBe(" WHERE name = \"Jacob\" AND (age < 25 OR age > 50) AND hasParents IS NOT NULL");
});

test("Test for correct complex OR logic", () => {
	dynamicWhere
		.clear()
		.and("name", sdw.Comparison.Equals, "Jacob")
		.and("age", sdw.Comparison.LessThan, 25)
		.or("age", sdw.Comparison.GreaterThan, 50)
		.and("hasParents", sdw.Comparison.IsNotNull, true)
		.and("friend", sdw.Comparison.Equals, "Luke")
		.or("friend", sdw.Comparison.Equals, "Leia")
		.or("friend", sdw.Comparison.Like, "%James%");

	expect(dynamicWhere.getClauses()).toBe(" WHERE name = \"Jacob\" AND (age < 25 OR age > 50) AND hasParents IS NOT NULL AND (friend = \"Luke\" OR friend = \"Leia\" OR friend LIKE \"%James%\")");
});
