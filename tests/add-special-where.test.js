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

test("Adding a clause using IS and LIKE", () => {
    dynamicWhere.clear();
    dynamicWhere.add(sdw.Logic.And, "deleted", sdw.Comparison.IsNotNull, true);
    dynamicWhere.add(sdw.Logic.And, "canFly", sdw.Comparison.IsNull, undefined);
    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.Like, "%Jacob%");

    expect(dynamicWhere.getClauses()).toBe(" WHERE deleted IS NOT NULL AND name LIKE \"%Jacob%\"");
});
