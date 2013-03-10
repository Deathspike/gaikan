/**
 * Module initialization.
 */
var escape = /[&<>"'`]/g,
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
	// Check if the value is undefined or null.
	if (value === undefined || value === null) {
		// Return the value.
		return value;
	}
	// Return the value after escaping.
	return value.toString().replace(escapeAmpExp, '&#38;').replace(escapeLtExp, '&#60;').replace(escapeGtExp, '&#62;').replace(escapeQuotExp, '&#34;');
};