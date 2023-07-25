enum Comparison {
    DoesNotEqual = "!=",
        Equals = "=",
        GreaterThan = ">",
        GreaterThanOrEqual = ">=",
        IsNotNull = "IS NOT NULL",
        IsNull = "IS NULL",
        LessThan = "<",
        LessThanOrEqual = "<=",
        Like = "LIKE",
};

enum Logic {
    And = "AND",
        Or = "OR",
};

type Value = string | number | boolean | null | undefined;

interface Clause {
    comparisonOperator: Comparison;
    field: string;
    logicalOperator: Logic;
    skipValues: Value[];
    value: Value;
}

export default class SQLDynamicWhere {
    /**
     * Enumerated type for comparison operators
     */
    public static Comparison = Comparison;

    /**
     * Enumerated type for logical operators
     */
    public static Logic = Logic;

    /**
     * Initialize clause storage
     */
    private clauses: Clause[] = [];

    /**
     * Add a new dynamic where clause
     *
     * @param {string} field - The table field
     * @param {Comparison} comparisonOperator - The comparison operator of the where clause
     * @param {Value} value - The value to compare against
     * @param {Value[]} skipValues - (Optional) An array of values that should be considered as null
     */
    public addFirst(field: string, comparisonOperator: Comparison, value: Value, skipValues: Value[] = []): void {
        this.add(SQLDynamicWhere.Logic.And, field, comparisonOperator, value, skipValues);
    }

    /**
     * Add a new dynamic where clause
     *
     * @param {Logic} logicalOperator - The logical operator of the where clause
     * @param {string} field - The table field
     * @param {Comparison} comparisonOperator - The comparison operator of the where clause
     * @param {Value} value - The value to compare against
     * @param {Value[]} skipValues - (Optional) An array of values that should be considered as null
     */
    public add(logicalOperator: Logic, field: string, comparisonOperator: Comparison, value: Value, skipValues: Value[] = []): void {
        // If there is no value or it is "null" then do not add it to the array
        if (value === null || typeof (value) === "undefined" || skipValues.includes(value))
            return;

        // Store clause
        this.clauses.push({
            comparisonOperator,
            field,
            logicalOperator,
            skipValues,
            value,
        });
    }

    /**
     * Return all clauses.
     */
    public getClausesArray(): Clause[] {
        return this.clauses;
    }

    /**
     * Return only clause values.
     */
    public getValues(): Value[] {
        return this.clauses.map(clause => clause.value);
    }

    /**
     * @param {boolean} startNewWhere - (Optional) Choose whether the string contains the WHERE clause and if the first clause needs a logical operator
     * @returns A SQL query safe string that contains all the where clauses
     */
    public getClauses(startNewWhere: boolean = true, placeholder: string | null = null): string {
        let clauses = "";

        // Add WHERE keyword
        if (startNewWhere)
            clauses += " WHERE";

        // Add clauses
        this.clauses.forEach((clause, index) => {
            // Skip logical operator on the first clause
            if (index > 0 || !startNewWhere)
                clauses += ` ${clause.logicalOperator}`;

            clauses += ` ${clause.field} ${clause.comparisonOperator}`;

            if (typeof (placeholder) === "string")
                clauses += this.getValue(clause.comparisonOperator, placeholder, true);
            else
                clauses += this.getValue(clause.comparisonOperator, clause.value);
        });

        return clauses;
    }

    /**
     * @param {boolean} startNewWhere - (Optional) Choose whether the string contains the WHERE clause and if the first clause needs a logical operator
     * @param {string} placeholder - (Optional) Choose which string to use as a placeholder for values
     * @returns A SQL query safe string that contains all the where clauses
     */
    public getClausesWithValuePlaceholders(startNewWhere: boolean = true, placeholder: string = "(?)"): string {
        return this.getClauses(startNewWhere, placeholder);
    }

    /**
     * Clear all clauses
     */
    public clear(): void {
        this.clauses.length = 0;
    }

    /**
     * Formats a value for beeing added to the final query
     *
     * @param {Comparison} comparisonOperator - The comparison operator of the where clause
     * @param {Value} value - The value to compare against
     * @param {boolean} isPlaceholder - Indicates if the value is used for a query with placeholders
     */
    private getValue(comparisonOperator: Comparison, value: Value, isPlaceholder: boolean = false): string {
        if ([Comparison.IsNull, Comparison.IsNotNull].includes(comparisonOperator))
            return "";

        if (isPlaceholder)
            return ` ${value}`;

        if (typeof (value) === "string")
            return ` \"${value}\"`;

        return ` ${value}`;
    }
}
