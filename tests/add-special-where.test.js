import {
    expect,
    test
} from "@jest/globals";

import sdw from "../SQLDynamicWhere";

const dynamicWhere = new sdw();

test("Adding a clause using LIKE", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.Like, "Jacob");

    expect(dynamicWhere.getClausesArray().length).toBe(1);
    expect(dynamicWhere.getValues().length).toBe(1);
});

test("Adding a clause using LIKE with wildcards", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.Like, "%Jacob%");

    expect(dynamicWhere.getClausesArray().length).toBe(1);
    expect(dynamicWhere.getValues().length).toBe(1);
});

test("Adding a empty clause using IS", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.IsNull, null);

    expect(dynamicWhere.getClausesArray().length).toBe(0);
    expect(dynamicWhere.getValues().length).toBe(0);
});

test("Adding a clause using IS", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.IsNotNull, true);

    expect(dynamicWhere.getClausesArray().length).toBe(1);
    expect(dynamicWhere.getValues().length).toBe(1);
});

test("Adding a clause using IN", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "friends", sdw.Comparison.In, ["Luke", "Leia", "James"]);

    expect(dynamicWhere.getClauses()).toBe(" WHERE friends IN (\"Luke\", \"Leia\", \"James\")");
});

test("Adding a clause using IN placeholder", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "friends", sdw.Comparison.In, ["Luke", "Leia", "James"]);

    expect(dynamicWhere.getClausesWithValuePlaceholders()).toBe(" WHERE friends IN (?)");
});

test("Adding a clause using IN with skip", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "friends", sdw.Comparison.In, ["Luke", "Leia", "James"], ["Leia"]);

    expect(dynamicWhere.getClauses()).toBe(" WHERE friends IN (\"Luke\", \"James\")");
});

test("Adding a empty clause using IN", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "friends", sdw.Comparison.In, ["Leia"], ["Leia"]);

    expect(dynamicWhere.getClauses()).toBe(" WHERE");
});

test("Adding a clause using IS and LIKE", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "deleted", sdw.Comparison.IsNotNull, true);
    dynamicWhere.add(sdw.Logic.And, "canFly", sdw.Comparison.IsNull, undefined);
    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.Like, "%Jacob%");

    expect(dynamicWhere.getClauses()).toBe(" WHERE deleted IS NOT NULL AND name LIKE \"%Jacob%\"");
});

test("Test for correct OR logic", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.Equals, "Jacob");
    dynamicWhere.add(sdw.Logic.And, "age", sdw.Comparison.LessThan, 25);
    dynamicWhere.add(sdw.Logic.Or, "age", sdw.Comparison.GreaterThan, 50);
    dynamicWhere.add(sdw.Logic.And, "hasParents", sdw.Comparison.IsNotNull, true);

    expect(dynamicWhere.getClauses()).toBe(" WHERE name = \"Jacob\" AND (age < 25 OR age > 50) AND hasParents IS NOT NULL");
});

test("Test for correct complex OR logic", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.Equals, "Jacob");
    dynamicWhere.add(sdw.Logic.And, "age", sdw.Comparison.LessThan, 25);
    dynamicWhere.add(sdw.Logic.Or, "age", sdw.Comparison.GreaterThan, 50);
    dynamicWhere.add(sdw.Logic.And, "hasParents", sdw.Comparison.IsNotNull, true);
    dynamicWhere.add(sdw.Logic.And, "friend", sdw.Comparison.Equals, "Luke");
    dynamicWhere.add(sdw.Logic.Or, "friend", sdw.Comparison.Equals, "Leia");
    dynamicWhere.add(sdw.Logic.Or, "friend", sdw.Comparison.Like, "%James%");

    expect(dynamicWhere.getClauses()).toBe(" WHERE name = \"Jacob\" AND (age < 25 OR age > 50) AND hasParents IS NOT NULL AND (friend = \"Luke\" OR friend = \"Leia\" OR friend LIKE \"%James%\")");
});
