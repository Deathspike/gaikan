/**
 * Represents the runtime module. After compilation of a template, the compiled function
 * relies on some functionality mediated by the runtime module. This module provides features
 * such as filters, handlers and the implementation for includes and partials.
 */

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
	// Include the escape handler.
	escape: require('./handlers/escape-handler'),
	// Include the lower handler.
	lower: require('./handlers/lower-handler'),
	// Include the nl2br handler.
	nl2br: require('./handlers/nl2br-handler'),
	// Include the title handler.
	title: require('./handlers/title-handler'),
	// Include the unescape handler.
	unescape: require('./handlers/unescape-handler'),
	// Include the upper handler.
	upper: require('./handlers/upper-handler'),
	// Include the url handler.
	url: require('./handlers/url-handler'),
};

/**
 * Render a view from file.
 *
 * @param root The root data.
 * @param inputPartials The input partials.
 * @param file The file name.
 * @returns The rendered view.
 */
module.exports.render = null;