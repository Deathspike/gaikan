/**
 * The nl2br handler.
 *
 * @param value The value.
 * @returns The (modified) value.
 */
module.exports = function (value) {
	// Replace the new lines to break elements.
	return String(value).replace(/\n/g, '<br />');
};