/**
 * The empty filter.
 *
 * @param value The value.
 * @returns Indicates whether the value was empty.
 */
module.exports = function (value) {
	// Check if the value is invalid or is an empty array.
	if (!value || (value.constructor === Array && !value.length)) {
		// Return true.
		return true;
	}
	// Iterate through each property.
	for (var key in value) {
		// Check if this property is owned by the value.
		if (value.hasOwnProperty(key)) {
			// Return false.
			return false;
		}
	}
	// Return true.
	return true;
}