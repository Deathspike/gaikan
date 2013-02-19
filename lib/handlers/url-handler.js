/**
 * The url handler.
 *
 * @param value The value.
 * @returns The (modified) value.
 */
module.exports = function (value) {
	// Return the value.
	return encodeURIComponent(String(value));
};