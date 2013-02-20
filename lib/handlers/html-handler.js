/**
 * The html handler.
 *
 * @param value The value.
 * @returns The (modified) value.
 */
module.exports = function (value) {
	// Return the value.
	return String(value).replace(/[&<>"'`]/g, function (chr) {
		return '&#' + chr.charCodeAt(0) + ';';
	});
};