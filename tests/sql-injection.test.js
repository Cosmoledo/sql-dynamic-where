import {
    expect,
    test
} from "@jest/globals";

import sdw from "../SQLDynamicWhere";

const dynamicWhere = new sdw();

test("Test sql injection #1", () => {
    dynamicWhere.clear();

    // could be retrived from a html-form where the user should set his name
    // but this could end badly, if he knows what he does
    const userInput = `james \" OR 1=1 #`

    dynamicWhere.add(sdw.Logic.And, "name", sdw.Comparison.Equals, userInput);

    expect(dynamicWhere.getClauses()).toBe(" WHERE name = \"james \" OR 1=1 #\"");
});
