/**
 * Parse a beginning each-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.begin = function (state, attribute) {
	// Push the instruction to open a scope for filtering.
	state.push('(function (parent) {', 1);
	// Push the instruction to open the if-statement checking the parent.
	state.push('if (parent) {', 1);
	// Push the instruction to open the for-statement.
	state.push('for (var key in parent) {', 1);
	// Push the instruction to open the if-statement checking the validity of the property.
	state.push('if (parent.hasOwnProperty(key) && parent[key] !== undefined && parent[key] !== null) {', 1);
	// Push the instruction to open a scope for the children to run in.
	state.push('(function (parent, data) {', 1);
};

/**
 * Parse an end each-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Push the instruction to invoke the scope for the children to run in.
	state.push('})(data, parent[key]);', -1);
	// Push the instruction to close the hasOwnProperty if-statement.
	state.push('}', -1);
	// Push the instruction to close the for-statement.
	state.push('}', -1);
	// Push the instruction to close the parent if-statement.
	state.push('}', -1);
	// Push the instruction to invoke the scope for filtering.
	state.push('})(' + attribute.value + ');', -1);
};