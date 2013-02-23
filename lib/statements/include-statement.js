/**
 * Module dependencies.
 */
var utils = require('../utils');

/**
 * Parse a beginning include-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.begin = function (state, attribute) {
	// Increment the depth.
	state.depth += 1;
	// Push the instruction to open a scope for output partials.
	state.push('(function (outputPartials) {', 1);
};

/**
 * Parse an end include-statement.
 *
 * @param state The state.
 * @param attribute The attribute.
 */
module.exports.end = function (state, attribute) {
	// Extract the name- and data values.
	var values = utils.extract(attribute.value);
	// Decrement the depth.
	state.depth -= 1;
	// Push the instruction to invoke the runtime include.
	state.push('result += runtime.render(' + values.data + ', outputPartials, \'' + utils.inline(values.name) + '\');')
	// Push the instruction to invoke the scope for output partials.
	state.push('})([]);', -1);
};

/**
 * Parse an invocation include-statement.
 *
 * @param state The state.
 * @param attributes The attributes.
 */
module.exports.invoke = function (state, attribute) {
	// Extract the name- and data values.
	var values = utils.extract(attribute.value);
	// Push the instruction to invoke the runtime include.
	state.push('result += runtime.render(' + values.data + ', null, \'' + utils.inline(values.name) + '\');')
}