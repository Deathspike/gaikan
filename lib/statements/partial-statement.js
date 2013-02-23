/**
 * Module dependencies.
 */
var utils = require('../utils');

/**
 * Parse a beginning partial-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.begin = function (state, attribute) {
	// Check if the depth allows for the partial registration.
	if (state.depth !== 0) {
		// Push the instruction to open a scope.
		state.push('outputPartials[\'' + utils.inline(utils.extract(attribute.value).name) + '\'] = (function (data) {', 1);
		// Push the instruction to open and return the partial function.
		state.push('return function () {', 1);
		// Push the instruction to initialize the result.
		state.push('var result = \'\';');
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
		state.push('return result;');
		// Push the instruction to close the partial function.
		state.push('};', -1);
		// Push the instruction to close and invoke the scope.
		state.push('})(' + utils.extract(attribute.value).data + ');', -1);
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
	var values = utils.extract(attribute.value);
	// Push the instruction to invoke the runtime partial.
	state.push('result += inputPartials && \'' + utils.inline(values.name) + '\' in inputPartials ? inputPartials[\'' + utils.inline(values.name) + '\'](' + values.data + ') : \'\';');
}