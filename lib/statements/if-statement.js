/**
 * Parse a beginning if-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.begin = function (state, attribute) {
	// Push the instruction to open the if-statement.
	state.push('if (' + attribute.value + ') {', 1);
};

/**
 * Parse an end if-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Push the instruction to close the if-statement.
	state.push('}', -1);
};