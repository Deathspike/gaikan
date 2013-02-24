/**
 * Module initialization.
 */
var match = /[&<>"'`]/g;

/**
 * The escape handler.
 *
 * @param value The value.
 * @returns The (modified) value.
 */
module.exports = function (value) {
	// Check if the value is not an escape candidate.
	if (typeof value !== 'string' || !match.test(value)) {
		// Return the value.
		return value;
	}
	// Return the value after escaping.
	return value.replace(match, function (chr) {
		return '&#' + chr.charCodeAt(0) + ';';
	});
};