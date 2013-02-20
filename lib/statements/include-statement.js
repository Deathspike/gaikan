/**
 * Module dependencies.
 */
var code, extract;

/**
 * Initialize the include-statement.
 *
 * @param inputCode Prepare text to be embedded in a code segment.
 * @param inputExtract Extract the name- and data values.
 * @returns The module exports.
 */
module.exports = function (inputCode, inputExtract) {
	// Set the code function.
	code = inputCode;
	// Set the extract function.
	extract = inputExtract;
	// Return the module exports.
	return module.exports;
};

/**
 * Parse a beginning include-statement.
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
	// Increment the depth.
	state.depth += 1;
	// Push the instruction to open a scope for output partials.
	state.instructions.push('(function (outputPartials) {');
};

/**
 * Parse an end include-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Extract the name- and data values.
	var values = extract(attribute.value);
	// Decrement the depth.
	state.depth -= 1;
	// Push the instruction to invoke the runtime include.
	state.instructions.push('result += runtime.include(\'' + code(values.name) + '\', ' + values.data + ', outputPartials);')
	// Push the instruction to invoke the scope for output partials.
	state.instructions.push('})([]);');
};

/**
 * Parse an invocation include-statement.
 *
 * @param state The state.
 * @param attributes The attributes.
 */
module.exports.invoke = function (state, attribute) {
	// Extract the name- and data values.
	var values = extract(attribute.value);
	// Push the instruction to invoke the runtime include.
	state.instructions.push('result += runtime.include(\'' + code(values.name) + '\', ' + values.data + ');')
}