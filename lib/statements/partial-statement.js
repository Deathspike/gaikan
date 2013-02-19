/**
 * Module dependencies.
 */
var code, extract;

/**
 * Initialize the partial-statement.
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
 * Parse a beginning partial-statement.
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
	// Check if the depth allows for the partial registration.
	if (state.depth !== 0) {
		// Push the instruction to open a partial function.
		state.instructions.push('outputPartials[\'' + code(extract(attribute.value).name) + '\'] = function (runtime, data) {');
		// Push the instruction to initialize the result.
		state.instructions.push('var result = [];');
	}
	// Decrement the depth.
	state.depth -= 1;
};

/**
 * Parse an end partial-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Increment the depth.
	state.depth += 1;
	// Check if the depth indicates an inclusion scope.
	if (state.depth !== 0) {
		// Push the instruction to return the result.
		state.instructions.push('return result.join(\'\');');
		// Push the instruction to close the partial function.
		state.instructions.push('};');
	}
	// Otherwise this is not in an inclusion scope.
	else {
		// Parse an invocation partial-statement.
		module.exports.invoke(state, attribute);
	}
};

/**
 * Parse an invocation partial-statement.
 *
 * @param state The state.
 * @param attributes The attributes.
 */
module.exports.invoke = function (state, attribute) {
	// Extract the name- and data values.
	var values = extract(attribute.value);
	// Push the instruction to invoke the runtime partial.
	state.instructions.push('result.push(runtime.partial(\'' + code(values.name) + '\', ' + values.data + ', inputPartials));')
}