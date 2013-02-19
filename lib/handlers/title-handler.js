/**
 * The title handler.
 *
 * @param value The value.
 * @returns The (modified) value.
 */
module.exports = function (value) {
	// Change the value to title case.
	return String(value).replace(/\w\S*/g, function (txt) {
		// Ensure the first character is upper case and the remaining text lower case.
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};