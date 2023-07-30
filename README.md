```
  ___                       _     __      ___
 |   \ _  _ _ _  __ _ _ __ (_)__  \ \    / / |_  ___ _ _ ___
 | |) | || | ' \/ _` | '  \| / _|  \ \/\/ /| ' \/ -_) '_/ -_)
 |___/ \_, |_||_\__,_|_|_|_|_\__|   \_/\_/ |_||_\___|_| \___|
       |__/
```

Dynamically handle multiple WHERE clauses in your SQL statements.
This package makes it easier to pass in query parameters from an endpoint into your SQL query string.
If the value is undefined/null/_falsy_ it will not be added to the clauses string.

## Changes

Changes to original [imjncarlson/sql-dynamic-where](https://github.com/imjncarlson/sql-dynamic-where)

- Rewrite in TypeScript
- Support for IN, LIKE, IS NULL, IS NOT NULL
- Brackets around OR statements are added
  - Logic may be broken without
- Removed/Renamed internal variables
  - Example: `whereClauses` and `values` were combined into `clauses`
  - Example: renamed parameter `leadingLogicalOperator` to `startWithWhere`
- _Heavily_ changed API / function calls
  - Logic of parameter `leadingLogicalOperator`/`startWithWhere` was flipped
  - Renamed `addFirst` to `and`, also added `or`
  - Renamed `add` to `addClause`
  - Added `isEmpty`
  - Added function chaining

TODO/IDEAS:

- Preventing SQL injection / Escaping of values
  - Take a look at my test: [sql-injection.test.js](./tests/sql-injection.test.js)

## Setup

Adding sql-dynamic-where to your project

```bash
npm i sql-dynamic-where
```

Adding sql-dynamic-where to a script

```js
// const sdw = require("sql-dynamic-where")
import sdw from "SQLDynamicWhere";
const dynamicWhere = new sdw();
```

## Examples

Generating WHERE clauses with multiple variables

```js
// Clear any previously stored values
dynamicWhere.clear();

// Add where clauses
dynamicWhere
  .and("name", sdw.Comparison.Equals, "Jacob")
  .and("age", sdw.Comparison.LessThan, 50)
  .or("eyes", sdw.Comparison.DoesNotEqual, "blue");

// Returns: WHERE name = "Jacob" AND (age < 50 OR eyes != "blue")
dynamicWhere.getClauses()
```

Generating WHERE clauses with multiple variables, some undefined

```js
// Clear any previously stored values
dynamicWhere.clear();

// Add where clauses
dynamicWhere
  .and("name", sdw.Comparison.Equals, "Jacob")
  .and("age", sdw.Comparison.LessThan, undefined)
  .or("eyes", sdw.Comparison.DoesNotEqual, "blue");

// Returns: WHERE (name = "Jacob" OR eyes != "blue")
dynamicWhere.getClauses()
```

Generating WHERE clauses with a placeholder string for the values

```js
// Clear any previously stored values
dynamicWhere.clear();

// Add where clauses
dynamicWhere
  .and("name", sdw.Comparison.Equals, "Jacob")
  .and("age", sdw.Comparison.LessThan, 50)
  .or("eyes", sdw.Comparison.DoesNotEqual, "blue");

// Returns ["Jacob", 50, "blue"]
dynamicWhere.getValues()

// Returns: WHERE name = (?) AND (age < (?) OR eyes != (?))
dynamicWhere.getClausesWithValuePlaceholders()
```

Generating WHERE clauses snippet without the WHERE keyword

```js
// Clear any previously stored values
dynamicWhere.clear();

// Add where clauses
dynamicWhere
  .or("name", sdw.Comparison.Equals, "Jacob")
  .and("age", sdw.Comparison.LessThan, 50);

// Notice that false is being passed into this function
// Returns: OR name = "Jacob") AND age < 50
dynamicWhere.getClauses(false)
```

Generating WHERE clauses using IS and Like

```js
// Clear any previously stored values
dynamicWhere.clear();

// Add where clauses
dynamicWhere
  .and("deleted", sdw.Comparison.IsNotNull, true)
  .and("canFly", sdw.Comparison.IsNull, undefined)
  .and("name", sdw.Comparison.Like, "%Jacob%");

// Returns: WHERE deleted IS NOT NULL AND name LIKE "%Jacob%"
dynamicWhere.getClauses()
```

Generating WHERE clauses using IN

```js
// Clear any previously stored values
dynamicWhere.clear();

// Add where clauses
dynamicWhere.and("friends", sdw.Comparison.In, ["Luke", "Leia", "James"], ["Leia"]);

// Returns: WHERE friends IN ("Luke", "James")
dynamicWhere.getClauses()
```

## Supported operators

| Operator | supported | constant-name        | example                                                |
|----------|-----------|----------------------|--------------------------------------------------------|
| =        | YES       | `Equals`             | `and("name", sdw.Comparison.Equals, "Jacob");`         |
| !=       | YES       | `DoesNotEqual`       | `and("name", sdw.Comparison.DoesNotEqual, "Jacob");`   |
| >        | YES       | `GreaterThan`        | `and("age", sdw.Comparison.GreaterThan, 20);`          |
| >=       | YES       | `GreaterThanOrEqual` | `and("age", sdw.Comparison.GreaterThanOrEqual, 20);`   |
| <        | YES       | `LessThan`           | `and("age", sdw.Comparison.LessThan, 20);`             |
| <=       | YES       | `LessThanOrEqual`    | `and("age", sdw.Comparison.LessThanOrEqual, 20);`      |
| IN       | YES       | `In`                 | `and("friends", sdw.Comparison.In, ["Luke", "Leia"]);` |
| LIKE     | YES       | `Like`               | `and("friends", sdw.Comparison.Like, "%James%");`      |
| BETWEEN  | NO        |                      | Use  `LessThan` and `GreaterThan` manually             |

Additional support is given for:

| Operator    | constant-name | example                                                 |
|-------------|---------------|---------------------------------------------------------|
| IS NULL     | `IsNull`      | `and("deleted", sdw.Comparison.IsNull, true);`     |
| IS NOT NULL | `IsNotNull`   | `and("deleted", sdw.Comparison.IsNotNull, false);` |

## Function Overrides

Add additional values to skip in the clause

```js
and(field, comparisonOperator, value, skipValues = [])
or(field, comparisonOperator, value, skipValues = [])
```

Include leading logic operator and remove WHERE keyword

```js
getClauses(startWithWhere = true)
```

Include leading logic operator and remove WHERE keyword
Define a different placeholder string

```js
getClausesWithValuePlaceholders(startWithWhere = true, placeholderString = "(?)")
```

## Support

Report bugs on the [issues page](https://github.com/imjncarlson/sql-dynamic-where/issues)
Reach out to <imjncarlson@gmail.com> if you have questions!

## License

[MIT](https://choosealicense.com/licenses/mit/)
