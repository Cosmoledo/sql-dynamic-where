enum Comparison {
	DoesNotEqual = "!=",
	Equals = "=",
	GreaterThan = ">",
	GreaterThanOrEqual = ">=",
	In = "IN",
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

type ValueRaw = string | number | boolean | null | undefined;
type Value = ValueRaw | ValueRaw[];

interface Clause {
	comparisonOperator: Comparison;
	field: string;
	logicalOperator: Logic;
	skipValues: ValueRaw[];
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
	 * @param {Logic} logicalOperator - The logical operator of the where clause
	 * @param {string} field - The table field
	 * @param {Comparison} comparisonOperator - The comparison operator of the where clause
	 * @param {Value} value - The value to compare against
	 * @param {ValueRaw[]} skipValues - (Optional) An array of values that should be considered as null
	 */
	public addClause(logicalOperator: Logic, field: string, comparisonOperator: Comparison, value: Value, skipValues: ValueRaw[] = []): SQLDynamicWhere {
		const valid = this.isValueValid(value, skipValues);

		if (valid === false)
			return this;

		if (Array.isArray(valid))
			value = valid;

		this.clauses.push({
			comparisonOperator,
			field,
			logicalOperator,
			skipValues,
			value,
		});

		return this;
	}

	/**
	 * Add a new dynamic where clause using AND
	 *
	 * @param {string} field - The table field
	 * @param {Comparison} comparisonOperator - The comparison operator of the where clause
	 * @param {Value} value - The value to compare against
	 * @param {ValueRaw[]} skipValues - (Optional) An array of values that should be considered as null
	 */
	public and(field: string, comparisonOperator: Comparison, value: Value, skipValues: ValueRaw[] = []): SQLDynamicWhere {
		this.addClause(Logic.And, field, comparisonOperator, value, skipValues);
		return this;
	}

	/**
	 * Add a new dynamic where clause using OR
	 *
	 * @param {string} field - The table field
	 * @param {Comparison} comparisonOperator - The comparison operator of the where clause
	 * @param {Value} value - The value to compare against
	 * @param {ValueRaw[]} skipValues - (Optional) An array of values that should be considered as null
	 */
	public or(field: string, comparisonOperator: Comparison, value: Value, skipValues: ValueRaw[] = []): SQLDynamicWhere {
		this.addClause(Logic.Or, field, comparisonOperator, value, skipValues);
		return this;
	}

	/**
	 * @param {boolean} startWithWhere - (Optional) Choose whether the string contains the WHERE clause and if the first clause needs a logical operator
	 * @returns A SQL query that contains all the where clauses
	 */
	public getClauses(startWithWhere: boolean = true): string {
		return this.generateWhereQuery(startWithWhere, null);
	}

	/**
	 * @param {boolean} startWithWhere - (Optional) Choose whether the string contains the WHERE clause and if the first clause needs a logical operator
	 * @param {string} placeholder - (Optional) Choose which string to use as a placeholder for values
	 * @returns A SQL query that contains all the where clauses with placeholders
	 */
	public getClausesWithValuePlaceholders(startWithWhere: boolean = true, placeholder: string = "(?)"): string {
		return this.generateWhereQuery(startWithWhere, placeholder);
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
	 * Clear all clauses
	 */
	public clear(): SQLDynamicWhere {
		this.clauses.length = 0;
		return this;
	}

	/**
	 * @param {boolean} startWithWhere - (Optional) Choose whether the string contains the WHERE clause and if the first clause needs a logical operator
	 * @param {string} placeholder - (Optional) Choose which string to use as a placeholder for values
	 * @returns A SQL query that contains all the where clauses
	 */
	private generateWhereQuery(startWithWhere: boolean, placeholder: string | null): string {
		let clauses = "";

		// Add WHERE keyword
		if (startWithWhere)
			clauses += " WHERE";

		// Add clauses
		this.clauses.forEach((clause, index) => {
			// We also need to insert brackets around OR statements
			const nextClause = this.clauses[index + 1];

			// Skip logical operator on the first clause
			if (index > 0 || !startWithWhere)
				clauses += ` ${clause.logicalOperator}`;

			if (clause.logicalOperator === Logic.And && nextClause && nextClause.logicalOperator === Logic.Or)
				clauses += " (";
			else
				clauses += " ";

			clauses += `${clause.field} ${clause.comparisonOperator}`;

			if (typeof (placeholder) === "string")
				clauses += this.getValue(clause.comparisonOperator, placeholder, true);
			else
				clauses += this.getValue(clause.comparisonOperator, clause.value);

			if (clause.logicalOperator === Logic.Or && (nextClause ? nextClause.logicalOperator === Logic.And : true))
				clauses += ")";
		});

		return clauses;
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

		if (comparisonOperator === Comparison.In && Array.isArray(value))
			return " (" + value.map(val => this.getValue(comparisonOperator, val, isPlaceholder)).join(",").slice(1) + ")";

		if (isPlaceholder)
			return ` ${value}`;

		if (typeof (value) === "string")
			return ` \"${value}\"`;

		return ` ${value}`;
	}

	/**
	 * Formats a value for beeing added to the final query
	 *
	 * @param {Comparison} comparisonOperator - The comparison operator of the where clause
	 * @param {Value} value - The value to compare against
	 * @param {boolean} isPlaceholder - Indicates if the value is used for a query with placeholders
	 */
	private isValueValid(value: Value, skipValues: ValueRaw[]): boolean | ValueRaw[] {
		// If there is no value or it is "null" then do not add it to the array
		if (value !== 0 && (!value || typeof (value) === "undefined"))
			return false;

		// Also skip if value is considered as null
		if (Array.isArray(value)) {
			const filteredValue = value.filter(val => !skipValues.includes(val));
			if (filteredValue.length === 0)
				return false;
			return filteredValue;
		} else if (skipValues.includes(value))
			return false;

		return true;
	}
}
