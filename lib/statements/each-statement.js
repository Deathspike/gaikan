/**
 * Parse a beginning each-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.begin = function (state, attribute) {
	// Check if the insert position has not been set.
	if (state.insert === -1) {
		// Set the insert position.
		state.insert = state.instructions.length;
	}
	// Push the instruction to open a scope for filtering.
	state.instructions.push('(function (parent) {');
	// Push the instruction to open the if-statement checking the parent.
	state.instructions.push('if (parent) {');
	// Push the instruction to open the for-statement.
	state.instructions.push('for (var key in parent) {');
	// Push the instruction to open the if-statement checking the validity of the property.
	state.instructions.push('if (parent.hasOwnProperty(key) && parent[key] !== undefined && parent[key] !== null) {');
	// Push the instruction to open a scope for the children to run in.
	state.instructions.push('(function (parent, data) {');
};

/**
 * Parse an end each-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Push the instruction to invoke the scope for the children to run in.
	state.instructions.push('})(data, parent[key]);');
	// Push the instruction to close each for- and if-statement.
	state.instructions.push('}}}');
	// Push the instruction to invoke the scope for filtering.
	state.instructions.push('})(' + attribute.value + ');');
};