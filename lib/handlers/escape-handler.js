/**
 * Module initialization.
 */
var escape = /[&<>"'`]/,
	escapeAmpExp = /&/g,
	escapeLtExp = /</g,
	escapeGtExp = />/g,
	escapeQuotExp = /"/g;

/**
 * The escape handler.
 *
 * @param value The value.
 * @returns The (modified) value.
 */
module.exports = function (value) {
	// Check if the value is not an escape candidate.
	if (typeof value !== 'string' || !escape.test(value)) {
		// Return the value.
		return value;
	}
	// Test the value and escape it when necessary.
	return value.replace(escapeAmpExp, '&#38;').replace(escapeLtExp, '&#60;').replace(escapeGtExp, '&#62;').replace(escapeQuotExp, '&#34;');
};