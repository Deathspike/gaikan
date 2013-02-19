/**
 * Module dependencies.
 */
var gaikan;

/**
 * Represents the runtime module. After compilation of a template, the compiled function
 * relies on some functionality mediated by the runtime module. This module provides features
 * such as filters, handlers and the implementation for includes and partials.
 *
 * @param inputGaikan The Gaikan module.
 * @returns The module exports.
 */
module.exports = function (inputGaikan) {
	// Set the gaikan module.
	gaikan = inputGaikan;
	// Return the module exports.
	return module.exports;
};

/**
 * The filters.
 */
module.exports.filters = {
	// Include the isEmpty filter.
	isEmpty: require('./filters/isEmpty-filter'),
	// Include the sort filter.
	sort: require('./filters/sort-filter')
};

/**
 * The handlers.
 */
module.exports.handlers = {
	// Include the html handler.
	html: require('./handlers/html-handler'),
	// Include the lower handler.
	lower: require('./handlers/lower-handler'),
	// Include the nl2br handler.
	nl2br: require('./handlers/nl2br-handler'),
	// Include the title handler.
	title: require('./handlers/title-handler'),
	// Include the upper handler.
	upper: require('./handlers/upper-handler'),
	// Include the url handler.
	url: require('./handlers/url-handler'),
};

/**
 * Execute an include.
 *
 * @param name The name.
 * @param values The values.
 * @param outputPartials The output partials.
 * @returns The rendered include.
 */
module.exports.include = function (name, values, outputPartials) {
	// Compile a template from a path and include it.
	return gaikan.compileFromPath(name)(module.exports, values, outputPartials);
};

/**
 * Execute a partial.
 *
 * @param name The name.
 * @param values The values.
 * @param inputPartials The input partials.
 * @returns The rendered partial.
 */
module.exports.partial = function (name, values, inputPartials) {
	// Check if the path is included in the partials and execute it.
	return inputPartials && name in inputPartials ? inputPartials[name](module.exports, values) : '';
};