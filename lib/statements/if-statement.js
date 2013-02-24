/**
 * Parse a beginning if-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.begin = function (state, attribute) {
	// Push the instruction to open the if-statement.
	state.instructions.push({cmd: 'if (' + attribute.value + ') {', indent: 1});
};

/**
 * Parse an end if-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Push the instruction to close the if-statement.
	state.instructions.push({cmd: '}', indent: -1});
};