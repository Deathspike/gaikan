/**
 * The unescape handler.
 *
 * @param value The value.
 * @returns The (modified) value.
 */
module.exports = function (value) {
	// Return the value.
	return String(value).replace(/&#([0-9]{2});/g, function (match, oct) {
		return String.fromCharCode(parseInt(oct, 10));
	})
};