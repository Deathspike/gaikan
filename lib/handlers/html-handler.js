/**
 * The html handler.
 *
 * @param value The value.
 * @returns The (modified) value.
 */
module.exports = function (value) {
	// Return the value.
	return String(value).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};