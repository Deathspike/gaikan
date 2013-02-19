/**
 * Parse a beginning if-statement.
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
	// Push the instruction to open the if-statement.
	state.instructions.push('if (' + attribute.value + ') {');
};

/**
 * Parse an end if-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Push the instruction to close the if-statement.
	state.instructions.push('}');
};